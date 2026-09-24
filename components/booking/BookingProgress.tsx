"use client";

import Image from "next/image";
import Link from "next/link";

type BookingProgressProps = {
  currentStep: number;
  onStepClick?: (step: number) => void;
};

const steps = [
  { step: 1, label: "Patient details" },
  { step: 2, label: "Visit" },
  { step: 3, label: "Payment" },
  { step: 4, label: "Review" },
];

function BookingProgress({ currentStep, onStepClick }: BookingProgressProps) {
  const handleStepClick = (e: React.MouseEvent, step: number) => {
    e.preventDefault();
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 items-center w-full p-4 border-b border-border/15 z-50 fixed top-0 bg-background">
      <Link href="/" className="justify-self-start">
        <Image
          src="/logo-dark.svg"
          width={169}
          height={24}
          alt="ClinicDesk Logo"
          className="h-5 w-auto"
        />
      </Link>

      <div className="justify-self-end md:justify-self-center font-medium">
        <div className="flex md:hidden items-center space-x-2">
          {steps.map((step) => {
            const isCurrent = step.step === currentStep;

            return (
              <button
                key={step.step}
                type="button"
                onClick={(e) => handleStepClick(e, step.step)}
                className="cursor-pointer"
                aria-label={`Step ${step.step}: ${step.label}`}
                aria-current={isCurrent ? "step" : undefined}>
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full font-medium ${
                    isCurrent
                      ? "bg-text-primary text-background"
                      : "bg-input text-text-secondary"
                  }`}>
                  {step.step}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center space-x-6 whitespace-nowrap">
          {steps.map((step, index) => {
            const isCurrent = step.step === currentStep;

            return (
              <button
                key={step.step}
                type="button"
                onClick={(e) => handleStepClick(e, step.step)}
                className={`font-medium cursor-pointer ${
                  isCurrent
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary transition-colors"
                }`}
                aria-current={isCurrent ? "step" : undefined}>
                {index + 1}. {step.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block"></div>
    </div>
  );
}

export default BookingProgress;
