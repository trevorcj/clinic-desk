"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Search,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import {
  Appointment,
  AppointmentStatus,
  Provider,
} from "@/lib/types/appointment";
import { getAppointments, getProviders } from "@/app/services/appointments";
import { useFailureSimulation } from "@/app/context/FailureSimulationContext";
import { useToast } from "@/app/context/ToastContext";
import { exportAppointmentsToCsv } from "@/lib/exportCsv";
import AppointmentDetailPanel from "./AppointmentDetailPanel";

const statusBadgeStyles: Record<AppointmentStatus, string> = {
  scheduled: "bg-green-50 text-green-700 whitespace-nowrap",
  "checked-in": "bg-sky-50 text-sky-700 whitespace-nowrap",
  completed: "bg-neutral-100 text-neutral-700 whitespace-nowrap",
  cancelled: "bg-neutral-200 text-neutral-800 whitespace-nowrap",
  "no-show": "bg-red-50 text-red-700 whitespace-nowrap",
};

const columnHelper = createColumnHelper<Appointment>();

export default function AppointmentsTable() {
  const { simulateFailure } = useFailureSimulation();
  const { toast } = useToast();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(20),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [providerId, setProviderId] = useQueryState(
    "providerId",
    parseAsString.withDefault("all"),
  );
  const [visitType, setVisitType] = useQueryState(
    "visitType",
    parseAsString.withDefault("all"),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault("startsAt"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsString.withDefault("desc"),
  );
  const [selectedId, setSelectedId] = useQueryState(
    "appointmentId",
    parseAsString.withDefault(""),
  );

  const [localSearch, setLocalSearch] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  const [isExporting, setIsExporting] = useState(false);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setPage(1);
        setSearch(localSearch ? localSearch : null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, setPage, setSearch]);

  const { data: providersData = [] } = useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: getProviders,
    staleTime: 1000 * 60 * 10,
  });

  const providerMap = useMemo(() => {
    const map: Record<string, string> = {};
    providersData.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [providersData]);

  const statusList = useMemo(
    () => (status ? status.split(",").filter(Boolean) : []),
    [status],
  );

  const { data, isLoading, isError, error, refetch, isPlaceholderData } =
    useQuery({
      queryKey: [
        "appointments",
        page,
        pageSize,
        search,
        status,
        providerId,
        visitType,
        sortBy,
        sortOrder,
      ],
      queryFn: () =>
        getAppointments(
          {
            page,
            pageSize,
            search,
            status: statusList,
            providerId,
            visitType,
            sortBy,
            sortOrder: sortOrder as "asc" | "desc",
          },
          simulateFailure,
        ),
      placeholderData: keepPreviousData,
    });

  const appointmentsList = useMemo(() => data?.content || [], [data?.content]);
  const pagination = data?.pagination || {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  };

  const selectedAppointment = useMemo(() => {
    if (!selectedId) return null;
    return appointmentsList.find((a) => a.id === selectedId) || null;
  }, [selectedId, appointmentsList]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const res = await getAppointments(
        {
          all: true,
          search,
          status: statusList,
          providerId,
          visitType,
          sortBy,
          sortOrder: sortOrder as "asc" | "desc",
        },
        simulateFailure,
      );

      exportAppointmentsToCsv(res.content, providerMap);
      toast({
        message: `Exported ${res.content.length} appointments to CSV`,
        type: "success",
      });
    } catch {
      toast({
        message: "Failed to export appointments. Please retry.",
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearFilters = () => {
    setPage(1);
    setSearch(null);
    setStatus(null);
    setProviderId(null);
    setVisitType(null);
    setSortBy("startsAt");
    setSortOrder("desc");
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("patient", {
        header: "Patient",
        cell: (info) => {
          const patient = info.getValue();
          const initials = `${patient.firstName[0] || ""}${
            patient.lastName[0] || ""
          }`.toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-border/10 flex items-center justify-center text-sm text-text-primary shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text-primary text-[15px] truncate">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm text-text-secondary truncate mt-0.5">
                  {patient.email}
                </p>
                <p className="text-sm text-text-secondary truncate">
                  {patient.phone}
                </p>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("providerId", {
        header: "Provider",
        cell: (info) => {
          const id = info.getValue();
          const providerObj = providersData.find((p) => p.id === id);
          return (
            <div>
              <p className="font-medium text-text-primary text-[15px]">
                {providerObj?.name || id}
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                {providerObj?.specialty || "Specialist"}
              </p>
            </div>
          );
        },
      }),

      columnHelper.accessor("visitType", {
        header: "Visit Type",
        cell: (info) => {
          const type = info.getValue();
          const duration = info.row.original.durationMinutes;
          return (
            <div>
              <p className="font-medium text-text-primary text-[15px] capitalize">
                {type.replace("-", " ")}
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                {duration} min
              </p>
            </div>
          );
        },
      }),

      columnHelper.accessor("mode", {
        header: "Mode",
        cell: (info) => {
          const mode = info.getValue();
          const isTelehealth = mode === "telehealth";
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm capitalize ${
                isTelehealth
                  ? "bg-violet-50 text-purple-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
              {mode}
            </span>
          );
        },
      }),

      columnHelper.accessor("startsAt", {
        header: "Date & Time",
        cell: (info) => {
          const dateStr = info.getValue();
          const formatted = new Intl.DateTimeFormat("en-US", {
            timeZone: "Africa/Lagos",
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          }).format(new Date(dateStr));

          return (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-text-secondary shrink-0" />
              <span className="text-text-primary text-[15px] whitespace-nowrap">
                {formatted}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const st = info.getValue();
          return (
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-sm capitalize ${statusBadgeStyles[st]}`}>
              {st.replace("-", " ")}
            </span>
          );
        },
      }),
    ],
    [providersData],
  );

  // @reactCompilerIgnore
  const table = useReactTable({
    data: appointmentsList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: pagination.total,
  });

  const totalPages = pagination.totalPages;
  const startRow = pagination.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, pagination.total);

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-6 md:px-8 md:py-8">
      <div className="flex sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <h2>Appointments</h2>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isExporting || pagination.total === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-text-primary text-background rounded-full transition-colors cursor-pointer disabled:opacity-50 self-start">
          <Download className="w-3.5 h-3.5" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by patient name, email, or provider..."
            className="w-full rounded-full border border-border/15 bg-white pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-text-secondary focus:border-text-primary transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value ? e.target.value : null);
            }}
            className="appearance-none rounded-full border border-border/15 bg-white pl-4 pr-9 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary transition-all cursor-pointer">
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="checked-in">Checked-in</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-show</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={providerId}
            onChange={(e) => {
              setPage(1);
              setProviderId(e.target.value === "all" ? null : e.target.value);
            }}
            className="appearance-none rounded-full border border-border/15 bg-white pl-4 pr-9 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary transition-all cursor-pointer">
            <option value="all">All Providers</option>
            {providersData.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={visitType}
            onChange={(e) => {
              setPage(1);
              setVisitType(e.target.value === "all" ? null : e.target.value);
            }}
            className="appearance-none rounded-full border border-border/15 bg-white pl-4 pr-9 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary transition-all cursor-pointer">
            <option value="all">All Visit Types</option>
            <option value="initial">Initial Consultation</option>
            <option value="follow-up">Follow-up Visit</option>
            <option value="medication-management">Medication Management</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "startsAt-desc") {
                setSortBy("startsAt");
                setSortOrder("desc");
              } else if (val === "startsAt-asc") {
                setSortBy("startsAt");
                setSortOrder("asc");
              } else if (val === "patientName-asc") {
                setSortBy("patientName");
                setSortOrder("asc");
              } else if (val === "patientName-desc") {
                setSortBy("patientName");
                setSortOrder("desc");
              }
            }}
            className="appearance-none rounded-full border border-border/15 bg-white pl-4 pr-9 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary transition-all cursor-pointer">
            <option value="startsAt-desc">Date (Newest first)</option>
            <option value="startsAt-asc">Date (Oldest first)</option>
            <option value="patientName-asc">Patient Name (A-Z)</option>
            <option value="patientName-desc">Patient Name (Z-A)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {(search || status || providerId !== "all" || visitType !== "all") && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary border border-border/15 rounded-full hover:bg-stone-50 transition-colors cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 flex flex-col justify-between gap-4">
        <div className="relative border border-border/10 rounded-lg overflow-x-auto bg-white">
          {isPlaceholderData && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-2xs flex items-center justify-center z-10">
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-black text-white">
                Loading page...
              </span>
            </div>
          )}

          {isError ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
              <h3 className="font-medium text-text-primary text-base">
                Failed to load appointments
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm">
                {(error as Error)?.message ||
                  "An unexpected error occurred while fetching data."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 text-xs font-medium bg-black text-white rounded-full hover:bg-black/90 transition-colors cursor-pointer">
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="divide-y divide-border/10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200"></div>
                    <div className="space-y-1.5">
                      <div className="w-32 h-4 bg-stone-200 rounded"></div>
                      <div className="w-24 h-3 bg-stone-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-24 h-4 bg-stone-200 rounded"></div>
                  <div className="w-28 h-4 bg-stone-200 rounded"></div>
                  <div className="w-20 h-6 bg-stone-200 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : appointmentsList.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <p className="font-medium text-text-primary text-base">
                No appointments match
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Try adjusting your search terms or clearing your filters.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 text-sm font-medium border border-border/20 rounded-full hover:bg-stone-50 transition-colors cursor-pointer">
                Clear all filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-border/10 bg-stone-50/50 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="py-3 px-4">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border/10">
                {table.getRowModel().rows.map((row) => {
                  const isSelected = row.original.id === selectedId;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.original.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? "bg-stone-100" : "hover:bg-stone-50/70"
                      }`}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3.5 px-4 text-[15px]">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
          <p className="whitespace-nowrap text-sm text-text-secondary">
            Showing{" "}
            <span className="font-medium text-text-primary">
              {startRow} - {endRow}
            </span>{" "}
            of{" "}
            <span className="font-medium text-text-primary">
              {pagination.total}
            </span>{" "}
            appointments
          </p>

          <div className="flex items-center gap-6 justify-between w-full sm:w-auto sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                Rows per page:
              </span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPage(1);
                    setPageSize(Number(e.target.value));
                  }}
                  className="appearance-none rounded-full border border-border/15 bg-white pl-4 pr-8 py-1.5 text-sm font-medium text-text-primary outline-none focus:border-text-primary transition-all cursor-pointer">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || isPlaceholderData}
                className="p-1.5 rounded-full hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-text-secondary hover:text-text-primary"
                aria-label="Previous Page">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-medium text-text-primary px-1">
                {page} of {Math.max(1, totalPages)}
              </span>

              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isPlaceholderData}
                className="p-1.5 rounded-full hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-text-secondary hover:text-text-primary"
                aria-label="Next Page">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailPanel
          appointment={selectedAppointment}
          providerMap={providerMap}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
