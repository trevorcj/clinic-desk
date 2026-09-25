"use client";

import React, { useState } from "react";
import { X, Calendar, User, Video, Building2, ChevronDown } from "lucide-react";
import { Appointment, AppointmentStatus } from "@/lib/types/appointment";
import CancelAppointmentModal from "./CancelAppointmentModal";
import { useToast } from "@/app/context/ToastContext";
import {
  updateAppointmentStatus,
  GetAppointmentsResponse,
} from "@/app/services/appointments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFailureSimulation } from "@/app/context/FailureSimulationContext";

interface AppointmentDetailPanelProps {
  appointment: Appointment | null;
  providerMap: Record<string, string>;
  onClose: () => void;
  inline?: boolean;
}

const statusBadgeStyles: Record<AppointmentStatus, string> = {
  scheduled: "bg-green-50 text-green-700 whitespace-nowrap",
  "checked-in": "bg-sky-50 text-sky-700 whitespace-nowrap",
  completed: "bg-neutral-100 text-neutral-700 whitespace-nowrap",
  cancelled: "bg-neutral-200 text-neutral-800 whitespace-nowrap",
  "no-show": "bg-red-50 text-red-700 whitespace-nowrap",
};

export default function AppointmentDetailPanel({
  appointment,
  providerMap,
  onClose,
  inline = false,
}: AppointmentDetailPanelProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { toast } = useToast();
  const { simulateFailure } = useFailureSimulation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      status,
      cancellationReason,
    }: {
      status?: AppointmentStatus;
      cancellationReason?: string;
    }) =>
      updateAppointmentStatus({
        id: appointment!.id,
        status,
        cancellationReason,
        simulateFailure,
      }),
    onMutate: async (newVariables) => {
      await queryClient.cancelQueries({ queryKey: ["appointments"] });
      await queryClient.cancelQueries({
        queryKey: ["appointment", appointment?.id],
      });

      const prevTableData = queryClient.getQueriesData<GetAppointmentsResponse>(
        { queryKey: ["appointments"] },
      );
      const prevSingleData = queryClient.getQueryData<Appointment>([
        "appointment",
        appointment?.id,
      ]);

      queryClient.setQueriesData<GetAppointmentsResponse>(
        { queryKey: ["appointments"] },
        (oldData) => {
          if (!oldData?.content) return oldData;
          return {
            ...oldData,
            content: oldData.content.map((item: Appointment) =>
              item.id === appointment?.id
                ? {
                    ...item,
                    status: newVariables.status || item.status,
                    cancellationReason:
                      newVariables.cancellationReason ||
                      item.cancellationReason,
                  }
                : item,
            ),
          };
        },
      );

      if (appointment) {
        queryClient.setQueryData(
          ["appointment", appointment.id],
          (old: Appointment | undefined) => {
            if (!old) return old;
            return {
              ...old,
              status: newVariables.status || old.status,
              cancellationReason:
                newVariables.cancellationReason || old.cancellationReason,
            };
          },
        );
      }

      return { prevTableData, prevSingleData };
    },
    onError: (err: Error, _, context) => {
      if (context?.prevTableData) {
        context.prevTableData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.prevSingleData && appointment) {
        queryClient.setQueryData(
          ["appointment", appointment.id],
          context.prevSingleData,
        );
      }

      toast({
        message: err?.message || "Failed to update appointment",
        type: "error",
      });
    },
    onSuccess: (updated) => {
      toast({
        message: `Appointment status updated to ${updated.status}`,
        type: "success",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      if (appointment) {
        queryClient.invalidateQueries({
          queryKey: ["appointment", appointment.id],
        });
      }
    },
  });

  if (!appointment) return null;

  const providerName =
    providerMap[appointment.providerId] || appointment.providerId;

  const formattedDateTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(appointment.startsAt));

  const initials = `${appointment.patient.firstName[0] || ""}${
    appointment.patient.lastName[0] || ""
  }`.toUpperCase();

  const getValidStatusOptions = (
    current: AppointmentStatus,
  ): AppointmentStatus[] => {
    switch (current) {
      case "scheduled":
        return ["checked-in", "no-show"];
      case "checked-in":
        return ["completed"];
      default:
        return [];
    }
  };

  const validOptions = getValidStatusOptions(appointment.status);
  const canCancel =
    appointment.status === "scheduled" || appointment.status === "checked-in";

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as AppointmentStatus;
    if (!newStatus || newStatus === appointment.status) return;
    mutation.mutate({ status: newStatus });
  };

  const handleConfirmCancel = async (reason: string) => {
    await mutation.mutateAsync({
      status: "cancelled",
      cancellationReason: reason,
    });
    setIsCancelModalOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-white text-text-primary">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/10 shrink-0">
        <h3 className="text-base font-semibold text-text-primary">
          Appointment Details
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
          aria-label="Close details">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 py-5 flex items-center justify-between gap-4 border-b border-border/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-border/10 flex items-center justify-center text-sm font-medium text-text-primary shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-text-primary text-[15px] truncate">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </p>
            <p className="text-sm text-text-secondary truncate mt-0.5">
              {appointment.patient.email}
            </p>
            <p className="text-sm text-text-secondary truncate">
              {appointment.patient.phone}
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize shrink-0 ${
            statusBadgeStyles[appointment.status]
          }`}>
          {appointment.status.replace("-", " ")}
        </span>
      </div>

      <div className="px-6 py-3.5 grid grid-cols-3 gap-2 border-b border-border/10 bg-stone-50/30 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-text-secondary mb-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Date
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary truncate">
            {new Intl.DateTimeFormat("en-US", {
              timeZone: "America/New_York",
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(appointment.startsAt))}
          </p>
          <p className="text-sm text-text-secondary truncate">
            {new Intl.DateTimeFormat("en-US", {
              timeZone: "America/New_York",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            }).format(new Date(appointment.startsAt))}
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-text-secondary mb-1">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Doctor
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary truncate">
            {providerName}
          </p>
          <p className="text-sm text-text-secondary truncate">Physician</p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-text-secondary mb-1">
            {appointment.mode === "telehealth" ? (
              <Video className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Building2 className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="text-xs font-medium uppercase tracking-wider">
              Mode
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary truncate capitalize">
            {appointment.mode === "telehealth" ? "Telehealth" : "In-Person"}
          </p>
          <p className="text-sm text-text-secondary truncate">
            {appointment.mode === "telehealth" ? "Video Call" : "Clinic Visit"}
          </p>
        </div>
      </div>

      <div className="w-full border-b border-border/10 px-6 pt-3 shrink-0">
        <div className="inline-block border-b-2 border-black pb-2.5 px-1 font-medium text-sm text-text-primary">
          Details
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border/10 w-full">
        {appointment.cancellationReason && (
          <div className="px-6 py-5">
            <div className="space-y-2">
              <p className="text-[15px] font-semibold">Cancellation Reason</p>
              <p className="text-sm">{appointment.cancellationReason}</p>
            </div>
          </div>
        )}

        <div className="px-6 py-5 space-y-4">
          <h4 className="text-[15px] font-semibold text-text-primary">
            Visit Information
          </h4>
          <div className="space-y-3.5">
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Visit Type
              </p>
              <p className="text-sm font-medium text-text-primary mt-0.5 capitalize">
                {appointment.visitType.replace("-", " ")} (
                {appointment.durationMinutes} min)
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Mode</p>
              <p className="text-sm font-medium text-text-primary mt-0.5 capitalize">
                {appointment.mode === "telehealth" ? "Telehealth" : "In-Person"}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Provider
              </p>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                {providerName}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Date & Time
              </p>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                {formattedDateTime}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h4 className="text-[15px] font-semibold text-text-primary">
            Patient Information
          </h4>
          <div className="space-y-3.5">
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Date of Birth
              </p>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                {appointment.patient.dateOfBirth}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Email</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                {appointment.patient.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Phone</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                {appointment.patient.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h4 className="text-[15px] font-semibold text-text-primary">
            Insurance Information
          </h4>
          <div className="space-y-3.5">
            {appointment.insurance ? (
              <>
                <div>
                  <p className="text-sm text-text-secondary font-medium">
                    Insurance Carrier
                  </p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">
                    {appointment.insurance.carrier}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">
                    Member ID
                  </p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">
                    {appointment.insurance.memberId}
                  </p>
                </div>
                {appointment.insurance.groupNumber && (
                  <div>
                    <p className="text-sm text-text-secondary font-medium">
                      Group Number
                    </p>
                    <p className="text-sm font-medium text-text-primary mt-0.5">
                      {appointment.insurance.groupNumber}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-text-secondary font-medium">
                  Payment Method
                </p>
                <p className="text-sm font-medium text-text-primary mt-0.5">
                  Self-pay
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border/10 flex items-center gap-2 w-full bg-stone-50/50 shrink-0">
        <button
          type="button"
          onClick={() => setIsCancelModalOpen(true)}
          disabled={!canCancel || mutation.isPending}
          className={`flex-1 w-full py-3 px-5 text-sm font-medium rounded-full transition-colors text-center ${
            canCancel && !mutation.isPending
              ? "text-rose-700 border border-rose-200 bg-white hover:bg-rose-50 cursor-pointer"
              : "text-rose-700/40 border border-rose-200/40 bg-white/50 cursor-not-allowed opacity-50"
          }`}>
          Cancel Appointment
        </button>

        <div className="relative flex-1 w-full">
          <select
            value=""
            onChange={handleStatusSelect}
            disabled={validOptions.length === 0 || mutation.isPending}
            className={`w-full appearance-none pl-5 pr-10 py-3 text-sm font-medium rounded-full outline-none text-left transition-colors ${
              validOptions.length > 0 && !mutation.isPending
                ? "bg-black text-white hover:bg-black/90 cursor-pointer"
                : "bg-black/40 text-white/60 cursor-not-allowed opacity-50"
            }`}>
            <option value="" disabled>
              {mutation.isPending
                ? "Updating..."
                : validOptions.length > 0
                  ? "Update Status"
                  : "Status Finalized"}
            </option>
            {validOptions.map((opt) => (
              <option
                key={opt}
                value={opt}
                className="bg-white text-text-primary">
                Mark as {opt.replace("-", " ")}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-white absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        patientName={`${appointment.patient.firstName} ${appointment.patient.lastName}`}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isPending={mutation.isPending}
      />
    </div>
  );

  if (inline) {
    return <div className="w-full flex flex-col bg-white">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <aside className="w-screen max-w-md bg-white border-l border-border/10 h-full flex flex-col z-10">
          {content}
        </aside>
      </div>
    </div>
  );
}
