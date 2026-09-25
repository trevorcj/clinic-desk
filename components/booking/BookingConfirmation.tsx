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

        {booking.startsAt && (
          <div className="mt-6 w-full p-4 rounded-lg bg-stone-50 border border-border/10 space-y-1.5">
            <p className="text-text-primary">
              <span className="underline">Clinic time (New York)</span>:{" "}
              <span className="">
                {new Intl.DateTimeFormat("en-US", {
                  timeZone: "America/New_York",
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                }).format(new Date(booking.startsAt))}
              </span>
            </p>
            <p className="">
              <span className="underline">Your local time</span>:{" "}
              <span className=" text-text-primary">
                {new Intl.DateTimeFormat(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                }).format(new Date(booking.startsAt))}
              </span>
            </p>
          </div>
        )}

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
