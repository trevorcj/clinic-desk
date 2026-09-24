export type VisitType = "initial" | "follow-up" | "medication-management";
export type MeetingMode = "in-person" | "telehealth";
export type AppointmentStatus =
  | "scheduled"
  | "checked-in"
  | "completed"
  | "cancelled"
  | "no-show";

export interface PatientInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

export interface InsuranceInfo {
  carrier: string;
  memberId: string;
  groupNumber?: string;
}

export interface Appointment {
  id: string;
  patient: PatientInfo;
  providerId: string;
  visitType: VisitType;
  mode: MeetingMode;
  startsAt: string;
  durationMinutes: 30 | 60;
  status: AppointmentStatus;
  insurance: InsuranceInfo | null;
  cancellationReason: string | null;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string>;
}
