import { Metadata } from "next";
import { Suspense } from "react";
import AppointmentsTable from "@/components/appointments/AppointmentsTable";

export const metadata: Metadata = {
  title: "Appointments",
};

function Appointments() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Suspense fallback={<p className="p-8 text-sm text-text-secondary">Loading appointments...</p>}>
        <AppointmentsTable />
      </Suspense>
    </div>
  );
}

export default Appointments;
