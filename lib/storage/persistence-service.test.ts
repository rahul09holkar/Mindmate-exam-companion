import { describe, it, expect, beforeEach } from "vitest";
import { PersistenceService } from "./persistence-service";
import { MemoryStore } from "./kv-store";
import { seedDemoData, DEMO_JOURNAL } from "./seed";
import type { CheckInInput, OnboardingInput } from "@/lib/types";

const onboarding: OnboardingInput = {
  examType: "NEET",
  studyPhase: "REVISION",
  pressureSources: ["Parents"],
  preferredTone: "GENTLE",
};

const checkIn: CheckInInput = {
  mood: "LOW",
  stressLevel: 8,
  energyLevel: 4,
  sleepQuality: "POOR",
  studyPressure: 9,
  journalText: "Tough day after the mock test.",
  tags: ["Mock Test"],
};

describe("PersistenceService", () => {
  let service: PersistenceService;

  beforeEach(() => {
    service = new PersistenceService(new MemoryStore());
  });

  it("assigns id and timestamps when saving a profile (not trusting input)", () => {
    const saved = service.saveProfile(onboarding);
    expect(saved.id).toBeTruthy();
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
    expect(service.getProfile()).toEqual(saved);
  });

  it("preserves id/createdAt when updating an existing profile", () => {
    const first = service.saveProfile(onboarding);
    const updated = service.saveProfile({ ...onboarding, examType: "JEE" });
    expect(updated.id).toBe(first.id);
    expect(updated.createdAt).toBe(first.createdAt);
    expect(updated.examType).toBe("JEE");
  });

  it("stores check-ins newest-first and round-trips by id", () => {
    const a = service.addCheckIn(checkIn);
    const b = service.addCheckIn({ ...checkIn, mood: "OKAY" });
    const all = service.listCheckIns();
    expect(all[0].id).toBe(b.id);
    expect(service.getCheckIn(a.id)?.mood).toBe("LOW");
  });

  it("saves and reuses a reflection per check-in (idempotent)", () => {
    const c = service.addCheckIn(checkIn);
    service.saveReflection(c.id, {
      emotionalSummary: "It sounds like a heavy day.",
      detectedTriggers: ["Mock test score"],
      patternHypothesis: "Self-worth may be linked to performance.",
      copingStrategy: "One small next step.",
      mindfulnessExercise: "Two minutes of slow breathing.",
      motivationalReframe: "One mock is feedback, not identity.",
      riskLevel: "MODERATE",
    });
    // Re-saving for the same check-in replaces rather than duplicates.
    service.saveReflection(c.id, {
      emotionalSummary: "Updated summary.",
      detectedTriggers: [],
      patternHypothesis: "",
      copingStrategy: "",
      mindfulnessExercise: "",
      motivationalReframe: "",
      riskLevel: "LOW",
    });
    expect(service.listReflections()).toHaveLength(1);
    expect(service.getReflectionByCheckIn(c.id)?.riskLevel).toBe("LOW");
  });

  it("exports and clears all data", () => {
    service.saveProfile(onboarding);
    service.addCheckIn(checkIn);
    const bundle = service.exportAll();
    expect(bundle.profile).not.toBeNull();
    expect(bundle.checkIns).toHaveLength(1);

    service.clearAll();
    expect(service.getProfile()).toBeNull();
    expect(service.listCheckIns()).toHaveLength(0);
  });

  it("tolerates corrupted stored JSON without throwing", () => {
    const store = new MemoryStore();
    store.setItem("mindmate.v1.checkins", "{not valid json");
    const svc = new PersistenceService(store);
    expect(svc.listCheckIns()).toEqual([]);
  });
});

describe("seedDemoData", () => {
  it("seeds a profile and a week of check-ins ending with the demo journal", () => {
    const service = new PersistenceService(new MemoryStore());
    seedDemoData(service);
    expect(service.getProfile()).not.toBeNull();
    expect(service.listCheckIns().length).toBeGreaterThanOrEqual(7);
    // Most recent entry is the hero demo journal.
    expect(service.listCheckIns()[0].journalText).toBe(DEMO_JOURNAL);
  });

  it("is idempotent — does not clobber existing data", () => {
    const service = new PersistenceService(new MemoryStore());
    const mine = service.addCheckIn(checkIn);
    seedDemoData(service);
    expect(service.listCheckIns()).toHaveLength(1);
    expect(service.listCheckIns()[0].id).toBe(mine.id);
  });
});
