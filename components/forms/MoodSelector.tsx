"use client";

import { MOOD_OPTIONS } from "@/lib/constants";
import type { Mood } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { FieldError } from "./FieldError";

type MoodSelectorProps = {
  value: Mood | null;
  onChange: (mood: Mood) => void;
  error?: string;
};

/**
 * Mood picker built as a native radio group inside a fieldset. Each option
 * shows an icon AND a text label, so the choice is never colour-only and is
 * fully keyboard navigable with arrow keys.
 */
export function MoodSelector({ value, onChange, error }: MoodSelectorProps) {
  const errorId = "mood-error";
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="font-medium text-ink">How is your mood today?</legend>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {MOOD_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-1 py-3 text-center transition-colors",
                selected
                  ? "border-brand bg-brand-soft text-brand-dark"
                  : "border-line bg-surface text-ink-soft hover:border-brand/40",
              )}
            >
              <input
                type="radio"
                name="mood"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span aria-hidden="true" className="text-2xl">
                {option.icon}
              </span>
              <span className="text-xs font-medium leading-tight">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
