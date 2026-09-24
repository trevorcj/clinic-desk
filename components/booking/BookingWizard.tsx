"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsInteger, useQueryState } from "nuqs";

import BookingNavigation from "./BookingNavigation";
import BookingProgress from "./BookingProgress";
import BookingConfirmation from "./BookingConfirmation";
import PatientDetailsStep from "./steps/PatientDetailsStep";
import VisitDetailsStep from "./steps/VisitDetailsStep";
import PaymentStep from "./steps/PaymentStep";
import ReviewStep from "./steps/ReviewStep";
import {
  bookingFormSchema,
  BookingFormData,
  VisitTypeSelection,
  MeetingMode,
  InsuranceDetailsFormData,
} from "@/lib/validations/booking";

export type {
  BookingFormData,
  VisitTypeSelection,
  MeetingMode,
  InsuranceDetailsFormData,
};

const DRAFT_STORAGE_KEY = "clinic_desk_booking_draft";

const defaultFormValues: BookingFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  visitType: "",
  mode: "",
  providerId: "",
  startsAt: "",
  durationMinutes: 30,
  paymentMethod: "self-pay",
  insurance: null,
};

function BookingWizard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] =
    useState<BookingFormData | null>(null);

  const [currentStep, setCurrentStep] = useQueryState(
    "step",
    parseAsInteger.withDefault(1),
  );

  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    mode: "onTouched",
    defaultValues: defaultFormValues,
  });

  const { watch, reset, trigger, getValues, handleSubmit, setError } = methods;

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === "object") {
          reset({ ...defaultFormValues, ...parsed });
        }
      }
    } catch {
      //
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((values) => {
      if (confirmedBooking) return;
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
      } catch {
        //
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, confirmedBooking]);

  async function validateStep(step: number): Promise<boolean> {
    if (step === 1) {
      return await trigger([
        "firstName",
        "lastName",
        "dateOfBirth",
        "email",
        "phone",
      ]);
    }

    if (step === 2) {
      return await trigger(["visitType", "mode", "providerId", "startsAt"]);
    }

    if (step === 3) {
      const paymentMethod = getValues("paymentMethod");
      if (paymentMethod === "insurance") {
        return await trigger([
          "paymentMethod",
          "insurance.carrier",
          "insurance.memberId",
        ]);
      }
      return await trigger(["paymentMethod"]);
    }

    return true;
  }

  async function handleNextStep() {
    if (currentStep < 4) {
      const isValid = await validateStep(currentStep);
      if (!isValid) {
        if (typeof document !== "undefined") {
          setTimeout(() => {
            const firstErrorEl = document.querySelector('[aria-invalid="true"]');
            if (firstErrorEl) {
              firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
              (firstErrorEl as HTMLElement).focus?.();
            }
          }, 50);
        }
        return;
      }
      setCurrentStep(currentStep + 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (currentStep === 4) {
      await handleSubmit(onSubmit)();
    }
  }

  function handlePreviousStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleNavigateToStep(targetStep: number) {
    if (targetStep === currentStep) return;

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    for (let s = currentStep; s < targetStep; s++) {
      const isValid = await validateStep(s);
      if (!isValid) {
        if (s !== currentStep) {
          setCurrentStep(s);
        }
        return;
      }
    }

    setCurrentStep(targetStep);
  }

  async function onSubmit(data: BookingFormData) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => null);

      if (res.status === 409) {
        setError("startsAt", {
          type: "manual",
          message:
            json?.message ||
            "This time slot is already booked for this provider. Please select another time.",
        });
        setCurrentStep(2);
        return;
      }

      if (!res.ok) {
        setSubmitError(
          json?.message ||
            "An error occurred while creating the appointment. Please try again.",
        );
        return;
      }

      try {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        //
      }

      setConfirmedBooking(data);
    } catch {
      setSubmitError(
        "Network connection error. Please check your network and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBookAnother() {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      //
    }
    reset(defaultFormValues);
    setConfirmedBooking(null);
    setCurrentStep(1);
  }

  if (confirmedBooking) {
    return (
      <main className="relative w-full px-6 py-20 min-h-screen flex items-center justify-center">
        <BookingConfirmation
          booking={confirmedBooking}
          onBookAnother={handleBookAnother}
        />
      </main>
    );
  }

  function renderStepComponent() {
    switch (currentStep) {
      case 1:
        return <PatientDetailsStep />;
      case 2:
        return <VisitDetailsStep />;
      case 3:
        return <PaymentStep />;
      case 4:
        return (
          <ReviewStep
            submitError={submitError}
            onGoToStep={handleNavigateToStep}
          />
        );
      default:
        return <PatientDetailsStep />;
    }
  }

  return (
    <main className="relative w-full">
      <BookingProgress
        currentStep={currentStep}
        onStepClick={handleNavigateToStep}
      />

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="h-full w-full px-10 py-28">
          {renderStepComponent()}
        </form>
      </FormProvider>

      <BookingNavigation
        currentStep={currentStep}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}

export default BookingWizard;
