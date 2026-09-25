"use client";

import { useFormContext } from "react-hook-form";
import { BookingFormData } from "../BookingWizard";

type ReviewStepProps = {
  submitError?: string | null;
  onGoToStep: (step: number) => void;
};

const providerLabels: Record<string, string> = {
  "provider-001": "Dr. Jane Smith (General Practitioner)",
  "provider-002": "Dr. Alex Jones (Cardiologist)",
  "provider-003": "Dr. Michael Chen (Psychiatrist)",
};

function ReviewStep({ submitError, onGoToStep }: ReviewStepProps) {
  const { watch } = useFormContext<BookingFormData>();
  const formData = watch();

  const providerDisplay =
    providerLabels[formData.providerId] ||
    formData.providerId ||
    "Not selected";

  const startsAtDate = formData.startsAt ? new Date(formData.startsAt) : null;
  const isDateValid = startsAtDate && !isNaN(startsAtDate.getTime());

  const clinicDateFormatted = isDateValid
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(startsAtDate)
    : "Not selected";

  const localDateFormatted = isDateValid
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(startsAtDate)
    : "";

  return (
    <section className="max-w-3xl mx-auto flex flex-col items-center justify-center">
      <div className="text-center">
        <h2>Review</h2>
        <p className="text-text-secondary mt-2">
          Review your details before submitting your booking.
        </p>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mt-6 w-full max-w-xl p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm text-center">
          {submitError}
        </div>
      )}

      <div className="mt-10 w-full flex flex-col items-stretch space-y-6">
        <div className="bg-background border border-border/20 rounded-md space-y-6">
          <div className="px-6 py-6 border-b border-border/20">
            <div className="flex items-center justify-between">
              <h3 className="bold-title">Patient details</h3>
              <button
                type="button"
                onClick={() => onGoToStep(1)}
                className="text-primary underline text-sm cursor-pointer">
                Go to step
              </button>
            </div>

            <div className="mt-6 space-y-1">
              <p>
                {formData.firstName} {formData.lastName}
              </p>
              <p>{formData.dateOfBirth}</p>
              <p>{formData.email}</p>
              <p>{formData.phone}</p>
            </div>
          </div>

          <div className="px-6 pb-6 border-b border-border/20">
            <div className="flex items-center justify-between">
              <h3 className="bold-title">Visit</h3>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="text-primary underline text-sm cursor-pointer">
                Go to step
              </button>
            </div>

            <div className="mt-6 space-y-1">
              <p className="capitalize">
                {formData.visitType
                  ? formData.visitType.replace("-", " ")
                  : "Not selected"}{" "}
                {formData.durationMinutes
                  ? `(${formData.durationMinutes} min)`
                  : ""}
              </p>
              <p className="capitalize">{formData.mode || "Not selected"}</p>
              <p>{providerDisplay}</p>
              <div className="flex gap-2">
                <p>{clinicDateFormatted}</p>
                {localDateFormatted &&
                  localDateFormatted !== clinicDateFormatted && (
                    <p className="text-text-secondary">
                      (Local time: {localDateFormatted})
                    </p>
                  )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center justify-between">
              <h3 className="bold-title">Payment</h3>
              <button
                type="button"
                onClick={() => onGoToStep(3)}
                className="text-primary underline text-sm cursor-pointer">
                Go to step
              </button>
            </div>

            <div className="mt-6 space-y-1">
              <p className="capitalize">{formData.paymentMethod}</p>
              {formData.paymentMethod === "insurance" && formData.insurance && (
                <>
                  <p>{formData.insurance.carrier}</p>
                  <p className="uppercase">{formData.insurance.memberId}</p>
                  {formData.insurance.groupNumber && (
                    <p className="uppercase">
                      Group: {formData.insurance.groupNumber}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReviewStep;
