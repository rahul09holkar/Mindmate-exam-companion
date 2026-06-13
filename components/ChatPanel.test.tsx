import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatPanel } from "./ChatPanel";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("ChatPanel", () => {
  it("renders the greeting, suggested prompts, and a labelled composer", () => {
    render(<ChatPanel />);

    expect(screen.getByText(/I'm here whenever you want to talk/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I feel behind" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "I panicked after a mock test" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Message MindMate")).toBeInTheDocument();
    // The not-a-therapist disclaimer is present.
    expect(screen.getByText(/not a therapist/i)).toBeInTheDocument();
  });
});
