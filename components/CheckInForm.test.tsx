import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckInForm } from "./CheckInForm";

// next/navigation's router is unavailable outside the App Router runtime.
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("CheckInForm", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders the core labelled fields", () => {
    render(<CheckInForm />);
    expect(screen.getByText("How is your mood today?")).toBeInTheDocument();
    expect(screen.getByLabelText("Stress level")).toBeInTheDocument();
    expect(screen.getByLabelText("Energy level")).toBeInTheDocument();
    expect(screen.getByText(/What's on your mind today/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Analyze my check-in" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors and does not navigate on an empty submit", async () => {
    const user = userEvent.setup();
    render(<CheckInForm />);
    await user.click(
      screen.getByRole("button", { name: "Analyze my check-in" }),
    );
    // Mood and journal are required → errors surface, no navigation occurs.
    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(push).not.toHaveBeenCalled();
  });
});
