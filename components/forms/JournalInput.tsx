"use client";

import { MAX_JOURNAL_LENGTH } from "@/lib/validation/checkin-schema";
import { FieldError } from "./FieldError";

type JournalInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/**
 * Free-text journal field — the core input the AI analyses. Labelled, with a
 * live character count and an accessible error association.
 */
export function JournalInput({ id, value, onChange, error }: JournalInputProps) {
  const countId = `${id}-count`;
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="font-medium text-ink">
        What&apos;s on your mind today?
      </label>
      <p className="mt-0.5 text-sm text-ink-soft">
        Write as much or as little as you like — there are no wrong answers.
      </p>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        maxLength={MAX_JOURNAL_LENGTH}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${countId}${error ? ` ${errorId}` : ""}`}
        placeholder="Today I felt…"
        className="mt-2 w-full resize-y rounded-xl border border-line bg-surface p-3 text-ink placeholder:text-ink-faint"
      />
      <div className="mt-1 flex items-center justify-between">
        <FieldError id={errorId} message={error} />
        <span id={countId} className="ml-auto text-xs text-ink-faint">
          {value.length} / {MAX_JOURNAL_LENGTH}
        </span>
      </div>
    </div>
  );
}
