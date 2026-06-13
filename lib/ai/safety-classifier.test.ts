import { describe, it, expect } from "vitest";
import { classifyRisk } from "./safety-classifier";

describe("classifyRisk", () => {
  it("returns LOW or MODERATE for ordinary exam stress", () => {
    const result = classifyRisk({
      text: "I'm stressed about my mock test and worried about my rank.",
      stressLevel: 6,
      mood: "OKAY",
    });
    expect(result.isCrisis).toBe(false);
    expect(["LOW", "MODERATE"]).toContain(result.level);
  });

  it("flags explicit self-harm intent as CRISIS", () => {
    const result = classifyRisk({
      text: "I don't want to live anymore, I want to end my life.",
    });
    expect(result.isCrisis).toBe(true);
    expect(result.level).toBe("CRISIS");
  });

  it("flags suicide mentions as CRISIS", () => {
    const result = classifyRisk({ text: "I keep having suicidal thoughts." });
    expect(result.level).toBe("CRISIS");
  });

  it("flags self-harm phrasing as CRISIS", () => {
    const result = classifyRisk({ text: "Sometimes I want to hurt myself." });
    expect(result.level).toBe("CRISIS");
  });

  it("escalates to HIGH when distress markers combine with high stress", () => {
    const result = classifyRisk({
      text: "I feel hopeless and I'm panicking before every exam.",
      stressLevel: 9,
      mood: "VERY_LOW",
    });
    expect(result.isCrisis).toBe(false);
    expect(result.level).toBe("HIGH");
  });

  it("treats calm, positive text as LOW", () => {
    const result = classifyRisk({
      text: "Had a good revision session and felt calm today.",
      stressLevel: 3,
      mood: "GOOD",
    });
    expect(result.level).toBe("LOW");
  });
});
