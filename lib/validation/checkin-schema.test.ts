import { describe, it, expect } from "vitest";
import { checkInSchema } from "./checkin-schema";
import type { CheckInInput } from "@/lib/types";

const validInput: CheckInInput = {
  mood: "OKAY",
  stressLevel: 6,
  energyLevel: 5,
  sleepQuality: "AVERAGE",
  studyPressure: 7,
  journalText: "Felt the pressure today but pushed through a revision block.",
  tags: ["Mock Test"],
};

describe("checkInSchema", () => {
  it("accepts a valid check-in", () => {
    const result = checkInSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects an out-of-range stress level", () => {
    const result = checkInSchema.safeParse({ ...validInput, stressLevel: 11 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer level", () => {
    const result = checkInSchema.safeParse({ ...validInput, energyLevel: 5.5 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid mood", () => {
    const result = checkInSchema.safeParse({ ...validInput, mood: "ECSTATIC" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty journal", () => {
    const result = checkInSchema.safeParse({ ...validInput, journalText: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects unknown tags", () => {
    const result = checkInSchema.safeParse({
      ...validInput,
      tags: ["Mock Test", "Not A Real Tag"],
    });
    expect(result.success).toBe(false);
  });

  it("de-duplicates tags", () => {
    const result = checkInSchema.safeParse({
      ...validInput,
      tags: ["Mock Test", "Mock Test"],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual(["Mock Test"]);
  });
});
