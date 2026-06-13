import { describe, it, expect } from "vitest";
import { reflectionContentSchema } from "./reflection-schema";

const valid = {
  emotionalSummary: "It sounds like today felt heavy.",
  detectedTriggers: ["Mock test performance"],
  patternHypothesis: "Your worth may feel tied to performance.",
  copingStrategy: "Take one small step today.",
  mindfulnessExercise: "Breathe in for 4, out for 6.",
  motivationalReframe: "One mock is feedback, not a verdict.",
  riskLevel: "MODERATE",
};

describe("reflectionContentSchema", () => {
  it("accepts a well-formed reflection", () => {
    expect(reflectionContentSchema.safeParse(valid).success).toBe(true);
  });

  it("allows an optional safetyNotes field", () => {
    const parsed = reflectionContentSchema.safeParse({
      ...valid,
      safetyNotes: "Support is available.",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a missing required field", () => {
    const { emotionalSummary, ...rest } = valid;
    void emotionalSummary;
    expect(reflectionContentSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an unknown risk level", () => {
    const parsed = reflectionContentSchema.safeParse({ ...valid, riskLevel: "PANIC" });
    expect(parsed.success).toBe(false);
  });

  it("rejects too many triggers", () => {
    const parsed = reflectionContentSchema.safeParse({
      ...valid,
      detectedTriggers: Array(9).fill("x"),
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an over-long summary", () => {
    const parsed = reflectionContentSchema.safeParse({
      ...valid,
      emotionalSummary: "a".repeat(801),
    });
    expect(parsed.success).toBe(false);
  });
});
