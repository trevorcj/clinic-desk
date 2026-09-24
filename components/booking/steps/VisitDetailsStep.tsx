"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BookingFormData } from "../BookingWizard";
import MeetingType from "../MeetingType";
import Provider from "../Provider";
import VisitType from "../VisitType";

function VisitDetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingFormData>();

  return (
    <section className="max-w-3xl mx-auto flex flex-col items-center justify-center">
      <div className="text-center">
        <h2>Select visit details</h2>
        <p className="text-text-secondary mt-2 sm:max-w-xl">
          Choose the type of care you need, your preferred provider, and a
          convenient appointment time.
        </p>
      </div>

      <div className="mt-16 w-full max-w-md flex flex-col items-stretch space-y-10">
        <VisitType />
        <MeetingType />
        <Provider />
        <Input
          label="Select date & time"
          type="datetime-local"
          step={1800}
          error={errors.startsAt?.message}
          {...register("startsAt")}
        />
      </div>
    </section>
  );
}

export default VisitDetailsStep;
