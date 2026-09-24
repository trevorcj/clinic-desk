import { NextRequest, NextResponse } from "next/server";
import { store, simulateLatency } from "@/lib/store";
import { AppointmentStatus } from "@/lib/types/appointment";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();

  const { id } = await params;
  const appointment = store.appointments.find((a) => a.id === id);

  if (!appointment) {
    return NextResponse.json(
      {
        success: false,
        message: "Appointment not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "OK",
    data: appointment,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();

  const simulateFailure = req.headers.get("x-simulate-failure") === "1";

  const { id } = await params;
  const appointmentIndex = store.appointments.findIndex((a) => a.id === id);

  if (appointmentIndex === -1) {
    return NextResponse.json(
      {
        success: false,
        message: "Appointment not found",
      },
      { status: 404 }
    );
  }

  let body: { status?: AppointmentStatus; cancellationReason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON body",
      },
      { status: 400 }
    );
  }

  const currentAppointment = store.appointments[appointmentIndex];

  if (body.status === "cancelled") {
    if (!body.cancellationReason || body.cancellationReason.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "A cancellation reason of at least 10 characters is required",
        },
        { status: 400 }
      );
    }
  }

  const updatedAppointment = {
    ...currentAppointment,
    status: body.status || currentAppointment.status,
    cancellationReason:
      body.status === "cancelled"
        ? body.cancellationReason || currentAppointment.cancellationReason
        : currentAppointment.cancellationReason,
  };

  store.appointments[appointmentIndex] = updatedAppointment;

  if (simulateFailure && Math.random() < 0.3) {
    return NextResponse.json(
      {
        success: false,
        message: "Simulated server failure after saving (500)",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "OK",
    data: updatedAppointment,
  });
}
