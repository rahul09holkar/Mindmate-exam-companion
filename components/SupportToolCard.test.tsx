import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SupportToolCard } from "./SupportToolCard";
import { SUPPORT_EXERCISES } from "@/lib/support-exercises";

describe("SupportToolCard", () => {
  it("renders the exercise title, summary, duration, and all steps", () => {
    const exercise = SUPPORT_EXERCISES[0]; // Box breathing
    render(<SupportToolCard exercise={exercise} />);

    expect(screen.getByText(exercise.title)).toBeInTheDocument();
    expect(screen.getByText(exercise.summary)).toBeInTheDocument();
    expect(screen.getByText(exercise.duration)).toBeInTheDocument();

    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(exercise.steps.length);
  });
});
