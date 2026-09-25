import React, { Suspense } from "react";
import DashboardLayout from "@/components/appointments/DashboardLayout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function AppointmentLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={null}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}
