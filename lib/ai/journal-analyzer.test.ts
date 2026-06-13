import { describe, it, expect } from "vitest";
import { analyzeCheckIn } from "./journal-analyzer";
import { CRISIS_REFLECTION, HIGH_RISK_SAFETY_NOTE } from "./safety-copy";
import type { CheckIn } from "@/lib/types";

// These run in mock mode (no OPENAI_API_KEY), so generateReflection returns the
// deterministic mock — letting us assert the orchestration + risk enforcement.

function makeCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: "c1",
    createdAt: "2026-06-13T00:00:00Z",
    mood: "OKAY",
    stressLevel: 5,
    energyLevel: 5,
    sleepQuality: "AVERAGE",
    studyPressure: 5,
    journalText: "Studied for a few hours and felt alright.",
    tags: [],
    ...overrides,
  };
}

describe("analyzeCheckIn", () => {
  it("short-circuits to the crisis reflection without analysis or advice", async () => {
    const result = await analyzeCheckIn(
      makeCheckIn({ journalText: "I want to end my life." }),
    );
    expect(result).toEqual(CRISIS_REFLECTION);
    expect(result.riskLevel).toBe("CRISIS");
    expect(result.detectedTriggers).toHaveLength(0);
  });

  it("returns an analyzed reflection for ordinary exam stress", async () => {
    const result = await analyzeCheckIn(
      makeCheckIn({ journalText: "Worried about my mock test rank." }),
    );
    expect(["LOW", "MODERATE", "HIGH"]).toContain(result.riskLevel);
    expect(result.detectedTriggers.length).toBeGreaterThan(0);
  });

  it("enforces the classifier verdict over the model and attaches the HIGH note", async () => {
    const result = await analyzeCheckIn(
      makeCheckIn({
        journalText: "I feel hopeless and I keep panicking before exams.",
        stressLevel: 9,
        mood: "VERY_LOW",
      }),
    );
    expect(result.riskLevel).toBe("HIGH");
    expect(result.safetyNotes).toBe(HIGH_RISK_SAFETY_NOTE);
  });
});
