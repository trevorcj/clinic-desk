"use client";

import { useFormContext } from "react-hook-form";
import { BookingFormData, VisitTypeSelection } from "./BookingWizard";

const visitOptions: Array<{
  id: Exclude<VisitTypeSelection, "">;
  title: string;
  description: string;
  duration: string;
}> = [
  {
    id: "initial",
    title: "Initial Consultation",
    description: "For new patients or new health concerns.",
    duration: "60 min",
  },
  {
    id: "follow-up",
    title: "Follow-up Visit",
    description: "For ongoing treatment reviews and check-ins.",
    duration: "60 min",
  },
  {
    id: "medication-management",
    title: "Medication Management",
    description: "For prescription refills and routine medication reviews.",
    duration: "30 min",
  },
];

function VisitType() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormData>();
  const selectedVisit = watch("visitType");

  const handleSelection = (optionId: Exclude<VisitTypeSelection, "">) => {
    setValue("visitType", optionId, { shouldValidate: true });
    setValue(
      "durationMinutes",
      optionId === "medication-management" ? 30 : 60,
      { shouldValidate: true }
    );
  };

  return (
    <div>
      <p className="text-sm font-medium text-text-primary mb-2">
        Type of visit
      </p>

      <fieldset className="space-y-1.5" aria-invalid={Boolean(errors.visitType)}>
        {visitOptions.map((option) => {
          const isSelected = option.id === selectedVisit;

          return (
            <label
              key={option.id}
              htmlFor={option.id}
              onClick={() => handleSelection(option.id)}
              className={`w-full flex justify-between items-center p-4 border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-text-primary bg-text-primary/2"
                  : errors.visitType
                  ? "border-error/60 bg-transparent hover:border-error"
                  : "border-text-primary/10 bg-transparent hover:border-text-primary/20"
              }`}>
              <div className="flex items-center gap-3.5">
                <div className="relative flex items-center justify-center pt-0.5">
                  <input
                    type="radio"
                    id={option.id}
                    value={option.id}
                    checked={isSelected}
                    {...register("visitType")}
                    onChange={() => handleSelection(option.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-text-primary"
                        : errors.visitType
                        ? "border-error"
                        : "border-text-primary/30"
                    }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="font-medium text-text-primary leading-tight">
                    {option.title}
                  </span>
                  <span className="text-text-secondary text-sm mt-1 leading-normal">
                    {option.description}
                  </span>
                </div>
              </div>

              <span className="text-text-secondary text-sm font-medium whitespace-nowrap pt-0.5 pl-4">
                {option.duration}
              </span>
            </label>
          );
        })}
      </fieldset>
      {errors.visitType?.message && (
        <p role="alert" className="text-xs text-error mt-1 px-1">
          {errors.visitType.message}
        </p>
      )}
    </div>
  );
}

export default VisitType;
