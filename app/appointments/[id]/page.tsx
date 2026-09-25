"use client";

import React, { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAppointmentById, getProviders } from "@/app/services/appointments";
import { useFailureSimulation } from "@/app/context/FailureSimulationContext";
import AppointmentDetailPanel from "@/components/appointments/AppointmentDetailPanel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { simulateFailure } = useFailureSimulation();

  const { data: providersData = [] } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
    staleTime: 1000 * 60 * 10,
  });

  const providerMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    providersData.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [providersData]);

  const {
    data: appointment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => getAppointmentById(id, simulateFailure),
    retry: false,
  });

  if (isError) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-text-secondary text-sm">
        Loading appointment details...
      </div>
    );
  }

  if (!appointment) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
      <Link
        href="/appointments"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to appointments
      </Link>

      <div className="border border-border/10 rounded-lg overflow-hidden bg-white">
        <AppointmentDetailPanel
          appointment={appointment}
          providerMap={providerMap}
          onClose={() => router.push("/appointments")}
          inline={true}
        />
      </div>
    </div>
  );
}
