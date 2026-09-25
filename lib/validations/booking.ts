import { z } from "zod";
import { differenceInYears, isValid, parseISO } from "date-fns";

export const visitTypeEnum = z.enum([
  "initial",
  "follow-up",
  "medication-management",
]);

export const meetingModeEnum = z.enum(["in-person", "telehealth"]);

export const paymentMethodEnum = z.enum(["self-pay", "insurance"]);

function parseDateRobust(val: string): Date | null {
  if (!val) return null;
  const isoDate = parseISO(val);
  if (isValid(isoDate)) return isoDate;

  const parts = val.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (isValid(d)) return d;
    } else if (parts[0].length === 4) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (isValid(d)) return d;
    }
  }
  return null;
}

export function getClinicTimeParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  let hour = 0;
  let minute = 0;
  let weekday = "";
  for (const p of parts) {
    if (p.type === "hour") hour = parseInt(p.value, 10);
    if (p.type === "minute") minute = parseInt(p.value, 10);
    if (p.type === "weekday") weekday = p.value;
  }
  return { hour, minute, weekday };
}

export const patientDetailsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const date = parseDateRobust(val);
      if (!date) return false;
      return differenceInYears(new Date(), date) >= 18;
    }, "Patient must be at least 18 years old"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length === 11 ? digits.startsWith("1") : digits.length === 10;
    }, "Please enter a complete 10-digit US phone number"),
});

export const insuranceDetailsSchema = z.object({
  carrier: z.string().trim().min(1, "Insurance carrier is required"),
  memberId: z.string().trim().min(1, "Member ID / Policy number is required"),
  groupNumber: z.string().trim().optional(),
});

export const bookingFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name must be 50 characters or less"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(50, "Last name must be 50 characters or less"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((val) => {
        const date = parseDateRobust(val);
        if (!date) return false;
        return differenceInYears(new Date(), date) >= 18;
      }, "Patient must be at least 18 years old"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .refine((val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length === 11 ? digits.startsWith("1") : digits.length === 10;
      }, "Please enter a complete 10-digit US phone number"),

    visitType: z.union([visitTypeEnum, z.literal("")]),
    mode: z.union([meetingModeEnum, z.literal("")]),
    providerId: z.string().min(1, "Please select a preferred provider"),
    startsAt: z.string().min(1, "Please select an appointment date and time"),
    durationMinutes: z.union([z.literal(30), z.literal(60)]),

    paymentMethod: paymentMethodEnum,
    insurance: insuranceDetailsSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.visitType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visitType"],
        message: "Please select a visit type",
      });
    }

    if (!data.mode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mode"],
        message: "Please select a meeting mode",
      });
    }

    if (data.startsAt) {
      const date = new Date(data.startsAt);
      if (isValid(date)) {
        if (date.getTime() <= Date.now()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startsAt"],
            message: "Appointment time cannot be in the past",
          });
        }
        const { hour, minute, weekday } = getClinicTimeParts(date);
        if (weekday === "Sat" || weekday === "Sun") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startsAt"],
            message: "Appointments are only available Monday through Friday (Clinic Eastern Time)",
          });
        }
        if (minute !== 0 && minute !== 30) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startsAt"],
            message: "Appointments must be scheduled on 30-minute increments (:00 or :30)",
          });
        }
        if (hour < 9 || hour >= 17) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startsAt"],
            message: "Appointments must be between 9:00 AM and 5:00 PM Eastern Time",
          });
        }
        const duration = data.visitType === "medication-management" ? 30 : 60;
        if (duration === 60 && hour === 16 && minute > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startsAt"],
            message: "60-minute visits cannot start after 4:00 PM Eastern Time as the clinic closes at 5:00 PM",
          });
        }
      }
    }

    if (data.paymentMethod === "insurance") {
      if (!data.insurance?.carrier || data.insurance.carrier.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["insurance", "carrier"],
          message: "Insurance carrier is required",
        });
      }
      if (!data.insurance?.memberId || data.insurance.memberId.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["insurance", "memberId"],
          message: "Member ID is required",
        });
      }
    }
  });

export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type VisitTypeSelection = BookingFormData["visitType"];
export type MeetingMode = BookingFormData["mode"];
export type InsuranceDetailsFormData = NonNullable<BookingFormData["insurance"]>;
export type PaymentMethodType = BookingFormData["paymentMethod"];
