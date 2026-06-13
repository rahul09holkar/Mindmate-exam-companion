import type { CheckIn, StudentProfile } from "@/lib/types";
import { createId } from "@/lib/utils/id";
import type { PersistenceService } from "./persistence-service";

/**
 * The hero journal from the demo scenario. Used as the most recent entry so a
 * fresh demo can immediately analyse it and show the headline insight.
 */
export const DEMO_JOURNAL =
  "I scored badly in my mock test and now I feel like I'm falling behind. " +
  "My parents keep asking about my rank and I can't sleep properly.";

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

/** A week of varied check-ins so the dashboard has a trend to show. */
function buildDemoCheckIns(): CheckIn[] {
  const days: Array<Omit<CheckIn, "id" | "createdAt"> & { daysAgo: number }> = [
    {
      daysAgo: 6,
      mood: "OKAY",
      stressLevel: 5,
      energyLevel: 6,
      sleepQuality: "AVERAGE",
      studyPressure: 5,
      journalText:
        "Steady day. Finished one chapter of revision and took a short walk.",
      tags: ["Backlog"],
    },
    {
      daysAgo: 5,
      mood: "LOW",
      stressLevel: 7,
      energyLevel: 4,
      sleepQuality: "POOR",
      studyPressure: 7,
      journalText:
        "Couldn't focus much. Kept comparing my progress to my friends'.",
      tags: ["Comparison", "Focus Issue"],
    },
    {
      daysAgo: 4,
      mood: "OKAY",
      stressLevel: 6,
      energyLevel: 5,
      sleepQuality: "AVERAGE",
      studyPressure: 6,
      journalText: "Better focus today after planning my week in small blocks.",
      tags: ["Focus Issue"],
    },
    {
      daysAgo: 3,
      mood: "GOOD",
      stressLevel: 4,
      energyLevel: 7,
      sleepQuality: "GOOD",
      studyPressure: 4,
      journalText: "Slept well and felt calmer. Mock practice went okay.",
      tags: ["Mock Test"],
    },
    {
      daysAgo: 2,
      mood: "LOW",
      stressLevel: 7,
      energyLevel: 4,
      sleepQuality: "POOR",
      studyPressure: 8,
      journalText: "Family asked about my rank again. Felt the pressure build.",
      tags: ["Family Pressure"],
    },
    {
      daysAgo: 1,
      mood: "LOW",
      stressLevel: 8,
      energyLevel: 3,
      sleepQuality: "POOR",
      studyPressure: 8,
      journalText:
        "Tired and anxious about the next mock. Hard to switch off at night.",
      tags: ["Exam Fear", "Mock Test"],
    },
    {
      daysAgo: 0,
      mood: "VERY_LOW",
      stressLevel: 9,
      energyLevel: 3,
      sleepQuality: "POOR",
      studyPressure: 9,
      journalText: DEMO_JOURNAL,
      tags: ["Mock Test", "Family Pressure", "Exam Fear"],
    },
  ];

  // Newest first (daysAgo ascending → today's entry leads) to match the
  // service's storage ordering convention.
  return days
    .sort((a, b) => a.daysAgo - b.daysAgo)
    .map(({ daysAgo, ...rest }) => ({
      id: createId(),
      createdAt: isoDaysAgo(daysAgo),
      ...rest,
    }));
}

function buildDemoProfile(): StudentProfile {
  const now = new Date().toISOString();
  return {
    id: createId(),
    examType: "JEE",
    targetExamDate: "2027-01",
    studyPhase: "FINAL_SPRINT",
    pressureSources: ["Parents", "Mock Scores", "Sleep"],
    preferredTone: "GENTLE",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Populate demo data for a quick walkthrough. Idempotent by default: it only
 * seeds when there is no existing profile or check-ins, so real entries are
 * never clobbered. Pass `{ force: true }` to reset to the demo state.
 */
export function seedDemoData(
  service: PersistenceService,
  { force = false }: { force?: boolean } = {},
): void {
  const hasData =
    service.getProfile() !== null || service.listCheckIns().length > 0;
  if (hasData && !force) return;

  service.importAll({
    profile: buildDemoProfile(),
    checkIns: buildDemoCheckIns(),
    reflections: [],
  });
}
