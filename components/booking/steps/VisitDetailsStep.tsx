"use client";

import { useSyncExternalStore } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BookingFormData } from "../BookingWizard";
import MeetingType from "../MeetingType";
import Provider from "../Provider";
import VisitType from "../VisitType";

const emptySubscribe = () => () => {};

function getLocalOperatingHours(): string {
  try {
    const now = new Date();
    const nyDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
    }).format(now);
    const getNyTimeInLocal = (hour: number) => {
      const d = new Date(
        `${nyDateStr}T${String(hour).padStart(2, "0")}:00:00Z`,
      );
      const nyHourStr = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        hour12: false,
      }).format(d);
      const diffHours = hour - parseInt(nyHourStr, 10);
      return new Date(d.getTime() + diffHours * 3600000);
    };

    const openDate = getNyTimeInLocal(9);
    const closeDate = getNyTimeInLocal(17);
    const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const isNewYork =
      timeZoneName === "America/New_York" ||
      timeZoneName === "US/Eastern" ||
      timeZoneName === "America/Detroit";

    if (!isNewYork) {
      const openStr = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(openDate);
      const closeStr = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(closeDate);
      return `${openStr} – ${closeStr}`;
    }
  } catch {}
  return "";
}

function VisitDetailsStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<BookingFormData>();

  const localHoursString = useSyncExternalStore(
    emptySubscribe,
    getLocalOperatingHours,
    () => "",
  );

  const startsAt = watch("startsAt");
  const startsAtDate = startsAt ? new Date(startsAt) : null;
  const isDateValid = startsAtDate && !isNaN(startsAtDate.getTime());

  const clinicTimeFormatted = isDateValid
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(startsAtDate)
    : "";

  const localTimeFormatted = isDateValid
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(startsAtDate)
    : "";

  return (
    <section className="max-w-3xl mx-auto flex flex-col items-center justify-center">
      <div className="text-center">
        <h2>Select visit details</h2>
        <p className="text-text-secondary mt-2 sm:max-w-xl">
          The clinic is open 9:00 AM – 5:00 PM EDT, Monday to Friday.{" "}
          {localHoursString && (
            <span className="mt-1">
              Book between {localHoursString} (Monday to Friday).
            </span>
          )}
        </p>
      </div>

      <div className="mt-16 w-full max-w-md flex flex-col items-stretch space-y-10">
        <VisitType />
        <MeetingType />
        <Provider />
        <div>
          <Input
            label="Select date & time"
            type="datetime-local"
            step={1800}
            error={errors.startsAt?.message}
            {...register("startsAt")}
          />

          {isDateValid && (
            <div className="mt-4 p-3.5 rounded-lg bg-stone-50 border border-border/10 text-sm space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
                Selected Appointment Time
              </p>
              <p className="text-text-primary">
                <span className="underline">Clinic time (New York)</span>
                {": "}
                <span className="">{clinicTimeFormatted}</span>
              </p>
              <p className="">
                <span className="underline">Your local time</span>
                {": "}
                <span className=" text-text-primary">{localTimeFormatted}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default VisitDetailsStep;
