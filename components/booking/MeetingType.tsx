"use client";

import { useFormContext } from "react-hook-form";
import { BookingFormData, MeetingMode } from "./BookingWizard";

const meetingOptions: Array<{
  id: Exclude<MeetingMode, "">;
  title: string;
  description: string;
}> = [
  {
    id: "in-person",
    title: "In-person",
    description: "Visit our clinic in person",
  },
  {
    id: "telehealth",
    title: "Telehealth",
    description: "Connect via video call",
  },
];

function MeetingType() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormData>();
  const selectedMode = watch("mode");

  const handleSelection = (optionId: MeetingMode) => {
    setValue("mode", optionId, { shouldValidate: true });
  };

  return (
    <div>
      <p className="text-sm font-medium text-text-primary mb-2">
        How would you like to meet?
      </p>

      <fieldset className="space-y-1.5" aria-invalid={Boolean(errors.mode)}>
        {meetingOptions.map((option) => {
          const isSelected = option.id === selectedMode;

          return (
            <label
              key={option.id}
              htmlFor={`mode-${option.id}`}
              onClick={() => handleSelection(option.id)}
              className={`w-full flex justify-between items-center p-4 border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-text-primary bg-text-primary/2"
                  : errors.mode
                  ? "border-error/60 bg-transparent hover:border-error"
                  : "border-text-primary/10 bg-transparent hover:border-text-primary/20"
              }`}>
              <div className="flex items-center gap-3.5">
                <div className="relative flex items-center justify-center pt-0.5">
                  <input
                    type="radio"
                    id={`mode-${option.id}`}
                    value={option.id}
                    checked={isSelected}
                    {...register("mode")}
                    onChange={() => handleSelection(option.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-text-primary"
                        : errors.mode
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
            </label>
          );
        })}
      </fieldset>
      {errors.mode?.message && (
        <p role="alert" className="text-xs text-error mt-1 px-1">
          {errors.mode.message}
        </p>
      )}
    </div>
  );
}

export default MeetingType;
