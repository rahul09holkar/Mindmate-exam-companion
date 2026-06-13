import { describe, it, expect } from "vitest";
import { onboardingSchema } from "./onboarding-schema";

describe("onboardingSchema", () => {
  it("accepts a valid profile and normalises empty target date to undefined", () => {
    const result = onboardingSchema.safeParse({
      examType: "JEE",
      targetExamDate: "",
      studyPhase: "FINAL_SPRINT",
      pressureSources: ["Parents", "Sleep"],
      preferredTone: "GENTLE",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.targetExamDate).toBeUndefined();
  });

  it("rejects an unknown exam type", () => {
    const result = onboardingSchema.safeParse({
      examType: "SAT",
      studyPhase: "STARTING",
      pressureSources: [],
      preferredTone: "GENTLE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown pressure source", () => {
    const result = onboardingSchema.safeParse({
      examType: "NEET",
      studyPhase: "REVISION",
      pressureSources: ["Aliens"],
      preferredTone: "DIRECT",
    });
    expect(result.success).toBe(false);
  });
});
