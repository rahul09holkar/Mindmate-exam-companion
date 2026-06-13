import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardView } from "./DashboardView";
import { getStorage } from "@/lib/storage";
import { seedDemoData } from "@/lib/storage/seed";

// next/link needs the App Router runtime; stub it to a plain anchor.
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
// Recharts needs a sized container in jsdom; the chart isn't what we're testing.
vi.mock("./WeeklyTrendChart", () => ({
  WeeklyTrendChart: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe("DashboardView", () => {
  beforeEach(() => getStorage().clearAll());

  it("shows the empty state with first-check-in and sample-data CTAs", async () => {
    render(<DashboardView />);
    expect(
      await screen.findByRole("link", { name: "Start your first check-in" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Explore with sample data" }),
    ).toBeInTheDocument();
  });

  it("renders the weekly summary and patterns from stored data (no AI call)", async () => {
    seedDemoData(getStorage(), { force: true });
    render(<DashboardView />);

    // The data-derived dashboard sections render purely from stored data.
    expect(
      await screen.findByText("This week, gently summarised"),
    ).toBeInTheDocument();
    expect(screen.getByText("Common triggers")).toBeInTheDocument();
    expect(screen.getByText("A small next habit")).toBeInTheDocument();
    expect(screen.getByText("Mood trend")).toBeInTheDocument();
  });
});
