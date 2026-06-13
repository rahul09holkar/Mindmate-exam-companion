"use client";

import { LEVEL_MIN, LEVEL_MAX } from "@/lib/types";

type LevelSliderProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Text anchors for the two ends — meaning never relies on position alone. */
  lowLabel: string;
  highLabel: string;
};

/**
 * A labelled 1–10 range input. Shows the current value as an <output> and
 * names both ends in text so the scale is understandable without colour.
 */
export function LevelSlider({
  id,
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: LevelSliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="text-lg font-semibold text-brand-dark">
          {value}
          <span className="text-sm font-normal text-ink-faint"> / {LEVEL_MAX}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={LEVEL_MIN}
        max={LEVEL_MAX}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value} out of ${LEVEL_MAX}`}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-brand"
      />
      <div className="mt-1 flex justify-between text-xs text-ink-faint">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
