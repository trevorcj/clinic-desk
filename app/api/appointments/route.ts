import { NextRequest, NextResponse } from "next/server";
import { store, simulateLatency } from "@/lib/store";
import { bookingFormSchema } from "@/lib/validations/booking";
import { Appointment, VisitType, MeetingMode } from "@/lib/types/appointment";

export async function GET(req: NextRequest) {
  await simulateLatency();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search")?.toLowerCase().trim();
  const providerId = searchParams.get("providerId");
  const statusParam = searchParams.getAll("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const sortBy = searchParams.get("sortBy") || "startsAt";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  let filtered = [...store.appointments];

  if (search) {
    filtered = filtered.filter(
      (a) =>
        a.patient.firstName.toLowerCase().includes(search) ||
        a.patient.lastName.toLowerCase().includes(search) ||
        a.patient.email.toLowerCase().includes(search)
    );
  }

  if (providerId) {
    filtered = filtered.filter((a) => a.providerId === providerId);
  }

  if (statusParam.length > 0) {
    filtered = filtered.filter((a) => statusParam.includes(a.status));
  }

  if (from) {
    filtered = filtered.filter((a) => new Date(a.startsAt) >= new Date(from));
  }

  if (to) {
    filtered = filtered.filter((a) => new Date(a.startsAt) <= new Date(to));
  }

  filtered.sort((a, b) => {
    let comp = 0;
    if (sortBy === "patientName") {
      const nameA = `${a.patient.lastName} ${a.patient.firstName}`;
      const nameB = `${b.patient.lastName} ${b.patient.firstName}`;
      comp = nameA.localeCompare(nameB);
    } else {
      comp = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    }
    return sortOrder === "desc" ? -comp : comp;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedContent = filtered.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    success: true,
    message: "OK",
    data: {
      content: paginatedContent,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    },
  });
}

export async function POST(req: NextRequest) {
  await simulateLatency();

  const simulateFailure = req.headers.get("x-simulate-failure") === "1";
  if (simulateFailure && Math.random() < 0.3) {
    return NextResponse.json(
      {
        success: false,
        message: "Simulated server failure (500)",
      },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON in request body",
      },
      { status: 400 }
    );
  }

  const parseResult = bookingFormSchema.safeParse(body);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const fieldPath = issue.path.join(".");
      fieldErrors[fieldPath] = issue.message;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parseResult.data;
  const startsAtIso = new Date(data.startsAt).toISOString();

  const existingConflict = store.appointments.find(
    (apt) =>
      apt.providerId === data.providerId &&
      apt.startsAt === startsAtIso &&
      apt.status !== "cancelled"
  );

  if (existingConflict) {
    return NextResponse.json(
      {
        success: false,
        message: "This provider is already booked at that start time.",
      },
      { status: 409 }
    );
  }

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    patient: {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      email: data.email,
      phone: data.phone,
    },
    providerId: data.providerId,
    visitType: data.visitType as VisitType,
    mode: data.mode as MeetingMode,
    startsAt: startsAtIso,
    durationMinutes: data.durationMinutes,
    status: "scheduled",
    insurance:
      data.paymentMethod === "insurance" && data.insurance
        ? {
            carrier: data.insurance.carrier,
            memberId: data.insurance.memberId,
            groupNumber: data.insurance.groupNumber,
          }
        : null,
    cancellationReason: null,
    createdAt: new Date().toISOString(),
  };

  store.appointments.push(newAppointment);

  return NextResponse.json(
    {
      success: true,
      message: "OK",
      data: newAppointment,
    },
    { status: 201 }
  );
}
