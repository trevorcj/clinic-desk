"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "../ui/input";
import { BookingFormData } from "./BookingWizard";

type PaymentType = BookingFormData["paymentMethod"];

const paymentOption: Array<{
  id: PaymentType;
  title: string;
  description: string;
}> = [
  {
    id: "self-pay",
    title: "Self-pay",
    description: "Pay directly out-of-pocket.",
  },
  {
    id: "insurance",
    title: "Insurance",
    description: "Use your health insurance coverage.",
  },
];

function PaymentMethod() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormData>();
  const selectedPayment = watch("paymentMethod");

  const handleSelection = (optionId: PaymentType) => {
    setValue("paymentMethod", optionId, { shouldValidate: true });
    if (optionId === "self-pay") {
      setValue("insurance", null, { shouldValidate: true });
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-text-primary mb-2">
        Payment method
      </p>

      <fieldset
        className="space-y-1.5"
        aria-invalid={Boolean(errors.paymentMethod)}>
        {paymentOption.map((option) => {
          const isSelected = option.id === selectedPayment;

          return (
            <label
              key={option.id}
              htmlFor={`payment-${option.id}`}
              onClick={() => handleSelection(option.id)}
              className={`w-full flex justify-between items-center p-4 border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-text-primary bg-text-primary/2"
                  : "border-text-primary/10 bg-transparent hover:border-text-primary/20"
              }`}>
              <div className="flex items-center gap-3.5">
                <div className="relative flex items-center justify-center pt-0.5">
                  <input
                    type="radio"
                    id={`payment-${option.id}`}
                    value={option.id}
                    checked={isSelected}
                    {...register("paymentMethod")}
                    onChange={() => handleSelection(option.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-text-primary"
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
      {errors.paymentMethod?.message && (
        <p role="alert" className="text-xs text-error mt-1 px-1">
          {errors.paymentMethod.message}
        </p>
      )}

      {selectedPayment === "insurance" && (
        <div className="mt-10 space-y-3">
          <Input
            label="Insurance carrier"
            type="text"
            placeholder="Blue Cross Blue Shield, Aetna, UnitedHealthcare"
            error={errors.insurance?.carrier?.message}
            {...register("insurance.carrier")}
          />

          <Input
            label="Member ID / policy number"
            type="text"
            placeholder="BCBS12345678"
            error={errors.insurance?.memberId?.message}
            className="uppercase"
            {...register("insurance.memberId")}
          />

          <Input
            label="Group number (optional)"
            type="text"
            placeholder="GRP98765"
            error={errors.insurance?.groupNumber?.message}
            {...register("insurance.groupNumber")}
          />
        </div>
      )}
    </div>
  );
}

export default PaymentMethod;
