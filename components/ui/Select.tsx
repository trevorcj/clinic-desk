import * as React from "react";

type SelectProps = Omit<React.ComponentProps<"select">, "placeholder"> & {
  label: string;
  description?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  error?: string;
};

export function Select({
  label,
  description,
  options,
  placeholder = "",
  className,
  error,
  id,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id || props.name || generatedId;
  const errorId = `${selectId}-error`;

  const borderClass = error
    ? "border-error focus:border-error focus:ring-1 focus:ring-error"
    : "border-text-primary/20 focus:border-text-primary";

  const baseClasses = `h-12 w-full appearance-none rounded-full border ${borderClass} pl-4 pr-10 bg-transparent transition-all duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-text-secondary/30 disabled:opacity-50 text-sm`;
  const combinedClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div>
        <label htmlFor={selectId} className="text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        )}
      </div>

      <div className="relative w-full flex items-center">
        <select
          id={selectId}
          className={combinedClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...props}>
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <svg
          className="w-4 h-4 text-text-secondary absolute right-4 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-error mt-0.5 px-2">
          {error}
        </p>
      )}
    </div>
  );
}
