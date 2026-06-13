"use client";

import type { Option } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { FieldError } from "./FieldError";

type OptionGroupProps<T extends string> = {
  name: string;
  legend: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  /** Layout: stacked cards (default) or a compact pill row. */
  variant?: "cards" | "pills";
};

/**
 * Single-select radio group rendered as accessible cards or pills. Uses a
 * fieldset/legend and native radios for keyboard and screen-reader support.
 */
export function OptionGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  variant = "cards",
}: OptionGroupProps<T>) {
  const errorId = `${name}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="font-medium text-ink">{legend}</legend>
      <div
        className={cn(
          "mt-3",
          variant === "cards" ? "space-y-2" : "flex flex-wrap gap-2",
        )}
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border transition-colors",
                variant === "cards" ? "p-3" : "px-4 py-2",
                selected
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface hover:border-brand/40",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              <span>
                <span
                  className={cn(
                    "block font-medium",
                    selected ? "text-brand-dark" : "text-ink",
                  )}
                >
                  {option.label}
                </span>
                {option.description ? (
                  <span className="block text-sm text-ink-soft">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
