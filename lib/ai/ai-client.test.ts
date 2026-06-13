import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateReflection, isMockMode } from "./ai-client";
import type { CheckIn, ReflectionContent } from "@/lib/types";

const checkIn: CheckIn = {
  id: "c1",
  createdAt: "2026-06-13T00:00:00Z",
  mood: "LOW",
  stressLevel: 7,
  energyLevel: 4,
  sleepQuality: "POOR",
  studyPressure: 8,
  journalText: "My mock test went badly and my parents asked about my rank.",
  tags: ["Mock Test"],
};

/** A complete, schema-valid reflection the fake provider can return. */
const validReflection: ReflectionContent = {
  emotionalSummary: "It sounds like today felt heavy.",
  detectedTriggers: ["Mock test performance"],
  patternHypothesis: "Your worth may feel tied to performance.",
  copingStrategy: "Take one small 20-minute step on a single topic.",
  mindfulnessExercise: "Breathe in for 4, out for 6, three times.",
  motivationalReframe: "One mock is feedback, not a verdict.",
  riskLevel: "MODERATE",
};

/** Build a fake OpenAI chat-completion response wrapping `content`. */
function openAiResponse(content: string): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content } }] }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("isMockMode", () => {
  it("is true when no API key is configured", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(isMockMode()).toBe(true);
  });

  it("is false when an API key is configured", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    expect(isMockMode()).toBe(false);
  });
});

describe("generateReflection", () => {
  it("returns the deterministic mock when no key is set (no network call)", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await generateReflection(checkIn);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.detectedTriggers).toContain("Mock test performance");
  });

  describe("with a configured key", () => {
    beforeEach(() => vi.stubEnv("OPENAI_API_KEY", "sk-test"));

    it("parses and validates a well-formed provider response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(openAiResponse(JSON.stringify(validReflection))),
      );

      const result = await generateReflection(checkIn);
      expect(result.patternHypothesis).toBe(validReflection.patternHypothesis);
      expect(result.riskLevel).toBe("MODERATE");
    });

    it("falls back to the mock when the provider returns invalid JSON", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(openAiResponse("totally not json")),
      );

      const result = await generateReflection(checkIn);
      // Mock fallback is always schema-valid and exam-aware.
      expect(result.detectedTriggers).toContain("Mock test performance");
    });

    it("falls back to the mock when the response fails schema validation", async () => {
      // Missing required fields → reflectionContentSchema rejects it.
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(openAiResponse(JSON.stringify({ emotionalSummary: "x" }))),
      );

      const result = await generateReflection(checkIn);
      expect(result.detectedTriggers).toContain("Mock test performance");
      expect(["LOW", "MODERATE", "HIGH"]).toContain(result.riskLevel);
    });

    it("falls back to the mock when the provider errors", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

      const result = await generateReflection(checkIn);
      expect(result.detectedTriggers).toContain("Mock test performance");
    });

    it("falls back to the mock on a non-OK provider status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("nope", { status: 500 })),
      );

      const result = await generateReflection(checkIn);
      expect(result.detectedTriggers).toContain("Mock test performance");
    });
  });
});
