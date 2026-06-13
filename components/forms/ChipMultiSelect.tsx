"use client";

import { cn } from "@/lib/utils/cn";

type ChipMultiSelectProps<T extends string> = {
  name: string;
  legend: string;
  hint?: string;
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
};

/**
 * Multi-select chip group backed by real checkboxes (visually hidden) so it is
 * keyboard accessible and announced correctly. Selection is shown with a
 * filled style plus a checkmark glyph — not colour alone.
 */
export function ChipMultiSelect<T extends string>({
  name,
  legend,
  hint,
  options,
  selected,
  onToggle,
}: ChipMultiSelectProps<T>) {
  return (
    <fieldset>
      <legend className="font-medium text-ink">{legend}</legend>
      {hint ? <p className="mt-0.5 text-sm text-ink-soft">{hint}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const isOn = selected.includes(option);
          return (
            <label
              key={option}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                isOn
                  ? "border-brand bg-brand-soft text-brand-dark"
                  : "border-line bg-surface text-ink-soft hover:border-brand/40",
              )}
            >
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={isOn}
                onChange={() => onToggle(option)}
                className="sr-only"
              />
              <span aria-hidden="true" className="text-xs">
                {isOn ? "✓" : "+"}
              </span>
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
