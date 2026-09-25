import {
  Appointment,
  AppointmentStatus,
  PaginationMeta,
  Provider,
} from "@/lib/types/appointment";

export interface GetAppointmentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string[];
  providerId?: string;
  visitType?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  all?: boolean;
}

export interface GetAppointmentsResponse {
  content: Appointment[];
  pagination: PaginationMeta;
}

export async function getAppointments(
  params: GetAppointmentsParams = {},
  simulateFailure = false
): Promise<GetAppointmentsResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", params.page.toString());
  if (params.pageSize) query.set("pageSize", params.pageSize.toString());
  if (params.search) query.set("search", params.search);
  if (params.providerId && params.providerId !== "all") query.set("providerId", params.providerId);
  if (params.visitType && params.visitType !== "all") query.set("visitType", params.visitType);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.all) query.set("all", "true");

  if (params.status && params.status.length > 0) {
    params.status.forEach((st) => {
      if (st && st !== "all") query.append("status", st);
    });
  }

  const headers: Record<string, string> = {};
  if (simulateFailure) {
    headers["x-simulate-failure"] = "1";
  }

  const res = await fetch(`/api/appointments?${query.toString()}`, { headers });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || "Failed to fetch appointments");
  }

  const json = await res.json();
  return json.data;
}

export async function getAppointmentById(
  id: string,
  simulateFailure = false
): Promise<Appointment> {
  const headers: Record<string, string> = {};
  if (simulateFailure) {
    headers["x-simulate-failure"] = "1";
  }

  const res = await fetch(`/api/appointments/${id}`, { headers });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || "Appointment not found");
  }

  const json = await res.json();
  return json.data;
}

export async function updateAppointmentStatus({
  id,
  status,
  cancellationReason,
  simulateFailure = false,
}: {
  id: string;
  status?: AppointmentStatus;
  cancellationReason?: string;
  simulateFailure?: boolean;
}): Promise<Appointment> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (simulateFailure) {
    headers["x-simulate-failure"] = "1";
  }

  const res = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status, cancellationReason }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || "Failed to update appointment");
  }

  const json = await res.json();
  return json.data;
}

export async function getProviders(): Promise<Provider[]> {
  const res = await fetch("/api/providers");
  if (!res.ok) {
    throw new Error("Failed to load providers");
  }
  const json = await res.json();
  return json.data;
}
