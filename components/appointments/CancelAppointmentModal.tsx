"use client";

import React, { useState } from "react";
import { z } from "zod";
import { X, AlertCircle } from "lucide-react";

interface CancelAppointmentModalProps {
  isOpen: boolean;
  patientName: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isPending: boolean;
}

const cancelReasonSchema = z
  .string()
  .trim()
  .min(10, "Cancellation reason must be at least 10 characters");

export default function CancelAppointmentModal({
  isOpen,
  patientName,
  onClose,
  onConfirm,
  isPending,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = cancelReasonSchema.safeParse(reason);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError(null);
    await onConfirm(result.data);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-border/20 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-border/10">
          <h3 className="text-base font-semibold text-text-primary">
            Cancel appointment
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1 text-text-secondary hover:text-text-primary cursor-pointer disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <p className="text text-text-primary">
            Are you sure you want to cancel the appointment for{" "}
            <span className="font-medium text-text-primary">{patientName}</span>
            ?
          </p>

          <div>
            <label
              htmlFor="cancel-reason"
              className="block text-sm font-medium text-text-primary mb-1">
              Reason for cancellation
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full rounded-md border p-2.5 text-sm outline-none transition-colors ${
                error
                  ? "border-error focus:border-error"
                  : "border-border/20 focus:border-text-primary"
              }`}
            />
            {error && (
              <p
                role="alert"
                className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
            <p className="text-xs text-text-secondary mt-1 text-right">
              {reason.trim().length}/10 characters minimum
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-text-primary border border-border/20 rounded-full hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50">
              Back
            </button>
            <button
              type="submit"
              disabled={isPending || reason.trim().length < 10}
              className="px-4 py-2 text-sm font-medium text-white bg-error rounded-full hover:bg-error/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
