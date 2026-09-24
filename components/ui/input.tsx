import * as React from "react";

type InputProps = React.ComponentProps<"input"> & {
  label: string;
  mask?: string;
  error?: string;
};

function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (!digits) return "";
  if (digits.length <= 3) return `+1 ${digits}`;
  if (digits.length <= 6) return `+1 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function Input({
  label,
  mask,
  className,
  error,
  id,
  onChange,
  type,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || props.name || generatedId;
  const errorId = `${inputId}-error`;

  const borderClass = error
    ? "border-error focus:border-error focus:ring-1 focus:ring-error"
    : "border-text-primary/20 focus:border-text-primary";

  const baseClasses = `h-12 w-full rounded-full border ${borderClass} px-4 transition-all duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-text-secondary/30 disabled:opacity-50 text-base sm:text-sm`;
  const combinedClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mask) {
      e.target.value = formatPhone(e.target.value);
    }
    onChange?.(e);
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={combinedClasses}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error mt-0.5 px-2">
          {error}
        </p>
      )}
    </div>
  );
}
