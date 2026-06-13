import { describe, it, expect } from "vitest";
import {
  buildTrend,
  commonTriggers,
  averageStress,
  moodDirection,
  weeklySummary,
  recommendedHabit,
  strategiesToLeanOn,
} from "./analytics";
import type { AIReflection, CheckIn } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

function checkIn(daysAgo: number, over: Partial<CheckIn> = {}): CheckIn {
  return {
    id: `c-${daysAgo}`,
    mood: "OKAY",
    stressLevel: 5,
    energyLevel: 5,
    sleepQuality: "AVERAGE",
    studyPressure: 5,
    journalText: "x",
    tags: [],
    createdAt: new Date(Date.now() - daysAgo * DAY).toISOString(),
    ...over,
  };
}

describe("buildTrend", () => {
  it("returns oldest→newest points capped at the window", () => {
    // newest-first input
    const checkIns = [checkIn(0), checkIn(1), checkIn(2)];
    const trend = buildTrend(checkIns, 7);
    expect(trend).toHaveLength(3);
    expect(new Date(trend[0].date).getTime()).toBeLessThan(
      new Date(trend[2].date).getTime(),
    );
  });

  it("maps mood to a 1–5 score", () => {
    const trend = buildTrend([checkIn(0, { mood: "GREAT" })]);
    expect(trend[0].mood).toBe(5);
  });
});

describe("commonTriggers", () => {
  it("combines reflection triggers and check-in tags, ranked by count", () => {
    const checkIns = [
      checkIn(0, { tags: ["Mock Test"] }),
      checkIn(1, { tags: ["Mock Test", "Comparison"] }),
    ];
    const reflections: AIReflection[] = [
      {
        id: "r1",
        checkinId: "c-0",
        emotionalSummary: "",
        detectedTriggers: ["Mock test performance", "Comparison"],
        patternHypothesis: "",
        copingStrategy: "Take a short walk.",
        mindfulnessExercise: "",
        motivationalReframe: "",
        riskLevel: "LOW",
        createdAt: new Date().toISOString(),
      },
    ];
    const top = commonTriggers(checkIns, reflections, 5);
    const byTrigger = Object.fromEntries(top.map((t) => [t.trigger, t.count]));
    // "Mock Test" tag appears twice; "Comparison" appears as a tag and a
    // detected trigger — both should total 2.
    expect(byTrigger["Mock Test"]).toBe(2);
    expect(byTrigger["Comparison"]).toBe(2);
    expect(byTrigger["Mock test performance"]).toBe(1);
    // Ties break alphabetically.
    expect(top[0].trigger).toBe("Comparison");
  });
});

describe("averageStress", () => {
  it("averages and rounds to one decimal", () => {
    expect(
      averageStress([checkIn(0, { stressLevel: 8 }), checkIn(1, { stressLevel: 5 })]),
    ).toBe(6.5);
  });
  it("returns 0 for no data", () => {
    expect(averageStress([])).toBe(0);
  });
});

describe("moodDirection", () => {
  it("detects an upward trend", () => {
    const checkIns = [
      checkIn(0, { mood: "GREAT" }),
      checkIn(1, { mood: "GOOD" }),
      checkIn(2, { mood: "LOW" }),
      checkIn(3, { mood: "VERY_LOW" }),
    ];
    expect(moodDirection(buildTrend(checkIns))).toBe("up");
  });
  it("is steady with a single point", () => {
    expect(moodDirection(buildTrend([checkIn(0)]))).toBe("steady");
  });
});

describe("weeklySummary", () => {
  it("invites the first check-in when empty", () => {
    expect(weeklySummary([], [])).toMatch(/once you log/i);
  });
  it("is non-diagnostic and mentions stress + top trigger", () => {
    const summary = weeklySummary(
      [checkIn(0, { stressLevel: 8, tags: ["Mock Test"] })],
      [],
    );
    expect(summary).toMatch(/not a diagnosis/i);
    expect(summary).toMatch(/Mock Test/);
  });
});

describe("recommendedHabit", () => {
  it("recommends a wind-down when sleep is poor often", () => {
    const checkIns = [
      checkIn(0, { sleepQuality: "POOR" }),
      checkIn(1, { sleepQuality: "POOR" }),
      checkIn(2, { sleepQuality: "AVERAGE" }),
    ];
    expect(recommendedHabit(checkIns).title).toMatch(/wind-down/i);
  });
  it("has a sensible default with no data", () => {
    expect(recommendedHabit([]).title).toBeTruthy();
  });
});

describe("strategiesToLeanOn", () => {
  it("dedupes coping strategies from reflections", () => {
    const base = {
      emotionalSummary: "",
      detectedTriggers: [],
      patternHypothesis: "",
      mindfulnessExercise: "",
      motivationalReframe: "",
      riskLevel: "LOW" as const,
      createdAt: new Date().toISOString(),
    };
    const reflections: AIReflection[] = [
      { ...base, id: "r1", checkinId: "c1", copingStrategy: "Walk." },
      { ...base, id: "r2", checkinId: "c2", copingStrategy: "Walk." },
      { ...base, id: "r3", checkinId: "c3", copingStrategy: "Breathe." },
    ];
    expect(strategiesToLeanOn(reflections)).toEqual(["Walk.", "Breathe."]);
  });
});
