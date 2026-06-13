import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskBadge } from "./RiskBadge";

describe("RiskBadge", () => {
  it("conveys each level with a text label, not colour alone", () => {
    const { rerender } = render(<RiskBadge level="LOW" />);
    expect(screen.getByText("Gentle day")).toBeInTheDocument();

    rerender(<RiskBadge level="MODERATE" />);
    expect(screen.getByText("Worth noticing")).toBeInTheDocument();

    rerender(<RiskBadge level="HIGH" />);
    expect(screen.getByText("Be kind to yourself")).toBeInTheDocument();
  });

  it("exposes an accessible tone label for screen readers", () => {
    render(<RiskBadge level="HIGH" />);
    expect(
      screen.getByLabelText("Reflection tone: Be kind to yourself"),
    ).toBeInTheDocument();
  });
});
