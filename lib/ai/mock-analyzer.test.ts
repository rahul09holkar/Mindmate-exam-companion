import { describe, it, expect } from "vitest";
import { mockAnalyze } from "./mock-analyzer";
import { analyzeCheckIn } from "./journal-analyzer";
import type { CheckIn } from "@/lib/types";
import { reflectionContentSchema } from "@/lib/validation/reflection-schema";

function makeCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: "c1",
    mood: "LOW",
    stressLevel: 7,
    energyLevel: 4,
    sleepQuality: "AVERAGE",
    studyPressure: 7,
    journalText: "An ordinary day.",
    tags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const DEMO_JOURNAL =
  "I scored badly in my mock test and now I feel like I'm falling behind. " +
  "My parents keep asking about my rank and I can't sleep properly.";

describe("mockAnalyze", () => {
  it("produces output that passes the reflection schema", () => {
    const result = mockAnalyze(makeCheckIn());
    expect(reflectionContentSchema.safeParse(result).success).toBe(true);
  });

  it("detects mock test stress", () => {
    const r = mockAnalyze(makeCheckIn({ journalText: "My mock test went badly." }));
    expect(r.detectedTriggers).toContain("Mock test performance");
  });

  it("detects parental pressure", () => {
    const r = mockAnalyze(
      makeCheckIn({ journalText: "My parents keep asking about my rank." }),
    );
    expect(r.detectedTriggers).toContain("Family expectations");
    expect(r.detectedTriggers).toContain("Pressure around rank");
  });

  it("detects sleep issues from text", () => {
    const r = mockAnalyze(
      makeCheckIn({ journalText: "I just can't sleep before exams." }),
    );
    expect(r.detectedTriggers).toContain("Sleep disruption");
  });

  it("detects sleep issues from the structured sleep field", () => {
    const r = mockAnalyze(
      makeCheckIn({ journalText: "Tough day overall.", sleepQuality: "POOR" }),
    );
    expect(r.detectedTriggers).toContain("Sleep disruption");
  });

  it("surfaces the self-worth pattern for the demo journal", () => {
    const r = mockAnalyze(
      makeCheckIn({
        journalText: DEMO_JOURNAL,
        tags: ["Mock Test", "Family Pressure"],
      }),
    );
    expect(r.detectedTriggers).toContain("Mock test performance");
    expect(r.detectedTriggers).toContain("Family expectations");
    expect(r.detectedTriggers).toContain("Sleep disruption");
    expect(r.patternHypothesis.toLowerCase()).toContain("self-worth");
    expect(r.motivationalReframe.toLowerCase()).toContain("feedback");
  });

  it("adapts coping language to the preferred tone", () => {
    const gentle = mockAnalyze(makeCheckIn(), { preferredTone: "GENTLE" });
    const direct = mockAnalyze(makeCheckIn(), { preferredTone: "DIRECT" });
    expect(gentle.copingStrategy).not.toBe(direct.copingStrategy);
  });
});

describe("analyzeCheckIn (orchestration)", () => {
  it("returns CRISIS without normal advice for self-harm content", async () => {
    const r = await analyzeCheckIn(
      makeCheckIn({ journalText: "I want to end my life." }),
    );
    expect(r.riskLevel).toBe("CRISIS");
    expect(r.detectedTriggers).toHaveLength(0);
    expect(r.safetyNotes).toBeTruthy();
  });

  it("enforces the classifier risk level onto the reflection", async () => {
    const r = await analyzeCheckIn(
      makeCheckIn({
        journalText: "I feel hopeless and keep panicking.",
        stressLevel: 9,
        mood: "VERY_LOW",
      }),
    );
    expect(r.riskLevel).toBe("HIGH");
    expect(r.safetyNotes).toBeTruthy();
  });
});
