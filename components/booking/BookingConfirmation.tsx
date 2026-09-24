"use client";

import Link from "next/link";
import Image from "next/image";
import { BookingFormData } from "./BookingWizard";

type BookingConfirmationProps = {
  booking: BookingFormData;
  onBookAnother?: () => void;
};

const providerNames: Record<string, string> = {
  "provider-001": "Dr. Jane Smith (General Practitioner)",
  "provider-002": "Dr. Alex Jones (Cardiologist)",
  "provider-003": "Dr. Michael Chen (Psychiatrist)",
  "provider-004": "Dr. Sarah Patel (Pediatrician)",
  "provider-005": "Dr. Robert Johnson (Dermatologist)",
  "provider-006": "Dr. Emily Taylor (Endocrinologist)",
};

function BookingConfirmation({
  booking,
  onBookAnother,
}: BookingConfirmationProps) {
  const providerLabel = providerNames[booking.providerId] || booking.providerId;

  return (
    <section className="max-w-2xl mx-auto">
      <Link href="/" className="justify-self-start">
        <Image
          src="/logo-dark.svg"
          width={169}
          height={24}
          alt="ClinicDesk Logo"
          className="h-5 w-auto"
        />
      </Link>
      <div className="flex flex-col items-start justify-start py-6">
        <div className="mt-10">
          <h2>Appointment Confirmed!</h2>
          <p className="text-text-secondary mt-2">
            Your appointment with {providerLabel} has been scheduled.
          </p>
        </div>

        <div className="mt-8 w-full flex flex-col sm:flex-row gap-4">
          <Link
            href="/appointments"
            className="w-full sm:w-1/2 bg-text-primary text-background font-medium px-6 py-3 rounded-full hover:bg-text-primary/90 transition-colors text-center cursor-pointer whitespace-nowrap">
            View all appointments
          </Link>
          {onBookAnother && (
            <button
              type="button"
              onClick={onBookAnother}
              className="w-full sm:w-1/2 border border-border text-text-primary font-medium px-6 py-3 rounded-full hover:bg-text-primary/5 transition-colors text-center cursor-pointer whitespace-nowrap">
              Book another
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default BookingConfirmation;
