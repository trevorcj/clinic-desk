import { Appointment } from "./types/appointment";

export function exportAppointmentsToCsv(
  appointments: Appointment[],
  providerMap: Record<string, string> = {}
) {
  const headers = [
    "Appointment ID",
    "Patient Name",
    "Patient DOB",
    "Patient Email",
    "Patient Phone",
    "Provider",
    "Visit Type",
    "Mode",
    "Date & Time (EDT/EST)",
    "Duration (Min)",
    "Status",
    "Insurance Carrier",
    "Member ID",
    "Group Number",
    "Cancellation Reason",
    "Created At",
  ];

  const rows = appointments.map((a) => {
    const providerName = providerMap[a.providerId] || a.providerId;
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(a.startsAt));

    return [
      a.id,
      `${a.patient.firstName} ${a.patient.lastName}`,
      a.patient.dateOfBirth,
      a.patient.email,
      a.patient.phone,
      providerName,
      a.visitType,
      a.mode,
      formattedDate,
      a.durationMinutes.toString(),
      a.status,
      a.insurance?.carrier || "N/A",
      a.insurance?.memberId || "N/A",
      a.insurance?.groupNumber || "N/A",
      a.cancellationReason || "",
      a.createdAt,
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((field) => `"${(field || "").toString().replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `clinic-appointments-${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
