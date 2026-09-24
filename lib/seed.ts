import { faker } from "@faker-js/faker";
import { Appointment, Provider, VisitType, MeetingMode, AppointmentStatus } from "./types/appointment";

export const initialProviders: Provider[] = [
  {
    id: "provider-001",
    name: "Dr. Jane Smith",
    specialty: "General Practitioner",
  },
  {
    id: "provider-002",
    name: "Dr. Alex Jones",
    specialty: "Cardiologist",
  },
  {
    id: "provider-003",
    name: "Dr. Michael Chen",
    specialty: "Psychiatrist",
  },
  {
    id: "provider-004",
    name: "Dr. Sarah Patel",
    specialty: "Pediatrician",
  },
  {
    id: "provider-005",
    name: "Dr. Robert Johnson",
    specialty: "Dermatologist",
  },
  {
    id: "provider-006",
    name: "Dr. Emily Taylor",
    specialty: "Endocrinologist",
  },
];

const cancellationReasons = [
  "Patient had a scheduling emergency and requested cancellation.",
  "Family emergency arose unexpectedly this morning.",
  "Resolved symptoms and no longer requires consultation.",
  "Insurance authorization delayed; patient rescheduled for next month.",
  "Transportation issues prevented patient from reaching clinic.",
];

export function generateSeedAppointments(count = 160): Appointment[] {
  faker.seed(2026);

  const appointments: Appointment[] = [];
  const bookedSlots = new Set<string>();

  const baseDate = new Date("2026-09-24T12:00:00Z");
  const dayOffsets: number[] = [];
  for (let i = -30; i <= 30; i++) {
    const candidate = new Date(baseDate);
    candidate.setUTCDate(baseDate.getUTCDate() + i);
    const day = candidate.getUTCDay();
    if (day !== 0 && day !== 6) {
      dayOffsets.push(i);
    }
  }

  const visitTypes: VisitType[] = ["initial", "follow-up", "medication-management"];
  const modes: MeetingMode[] = ["in-person", "telehealth"];
  const carriers = ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna"];

  let attempts = 0;
  while (appointments.length < count && attempts < count * 20) {
    attempts++;
    const provider = faker.helpers.arrayElement(initialProviders);
    const dayOffset = faker.helpers.arrayElement(dayOffsets);
    const visitType = faker.helpers.arrayElement(visitTypes);
    const durationMinutes = visitType === "medication-management" ? 30 : 60;

    const availableHours = durationMinutes === 60 ? [9, 10, 11, 12, 13, 14, 15, 16] : [9, 10, 11, 12, 13, 14, 15, 16];
    const hour = faker.helpers.arrayElement(availableHours);
    let minute = faker.helpers.arrayElement([0, 30]);
    if (durationMinutes === 60 && hour === 16) {
      minute = 0;
    }

    const slotDate = new Date(baseDate);
    slotDate.setUTCDate(baseDate.getUTCDate() + dayOffset);
    slotDate.setUTCHours(hour, minute, 0, 0);

    const slotIso = slotDate.toISOString();
    const slotKey = `${provider.id}_${slotIso}`;
    if (bookedSlots.has(slotKey)) {
      continue;
    }
    bookedSlots.add(slotKey);

    const isPast = slotDate.getTime() < baseDate.getTime();
    let status: AppointmentStatus;
    let cancellationReason: string | null = null;

    if (isPast) {
      status = faker.helpers.weightedArrayElement([
        { weight: 75, value: "completed" },
        { weight: 15, value: "cancelled" },
        { weight: 10, value: "no-show" },
      ]);
      if (status === "cancelled") {
        cancellationReason = faker.helpers.arrayElement(cancellationReasons);
      }
    } else {
      status = faker.helpers.weightedArrayElement([
        { weight: 80, value: "scheduled" },
        { weight: 15, value: "checked-in" },
        { weight: 5, value: "cancelled" },
      ]);
      if (status === "cancelled") {
        cancellationReason = faker.helpers.arrayElement(cancellationReasons);
      }
    }

    const hasInsurance = faker.datatype.boolean();
    const dob = faker.date.birthdate({ min: 19, max: 75, mode: "age" });
    const formattedPhone = `+1 ${faker.string.numeric(3)} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`;

    const createdAtDate = new Date(slotDate);
    createdAtDate.setUTCDate(slotDate.getUTCDate() - faker.number.int({ min: 1, max: 14 }));

    const appointment: Appointment = {
      id: `apt-${faker.string.alphanumeric({ length: 8, casing: "lower" })}`,
      patient: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dateOfBirth: dob.toISOString().split("T")[0],
        email: faker.internet.email().toLowerCase(),
        phone: formattedPhone,
      },
      providerId: provider.id,
      visitType,
      mode: faker.helpers.arrayElement(modes),
      startsAt: slotIso,
      durationMinutes,
      status,
      insurance: hasInsurance
        ? {
            carrier: faker.helpers.arrayElement(carriers),
            memberId: `MEM-${faker.string.alphanumeric(8).toUpperCase()}`,
            groupNumber: faker.datatype.boolean() ? `GRP-${faker.string.numeric(5)}` : undefined,
          }
        : null,
      cancellationReason,
      createdAt: createdAtDate.toISOString(),
    };

    appointments.push(appointment);
  }

  appointments.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  return appointments;
}
