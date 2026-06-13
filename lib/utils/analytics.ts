import type { AIReflection, CheckIn, CheckInTag, Mood } from "@/lib/types";

/**
 * Deterministic weekly-pattern analytics. Pure functions over stored data —
 * the dashboard uses these instead of calling the AI again (efficiency), and
 * reuses any cached reflections to enrich the trigger view.
 */

/** Map the mood enum to a 1–5 score for trend charting. */
export const MOOD_SCORE: Record<Mood, number> = {
  VERY_LOW: 1,
  LOW: 2,
  OKAY: 3,
  GOOD: 4,
  GREAT: 5,
};

export const MOOD_SCORE_LABELS: Record<number, string> = {
  1: "Very low",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export type TrendPoint = {
  /** ISO timestamp of the check-in. */
  date: string;
  /** Short weekday label for the x-axis. */
  label: string;
  mood: number;
  stress: number;
  energy: number;
  studyPressure: number;
};

function shortDayLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { weekday: "short" });
}

/**
 * Build an oldest→newest series of the most recent `days` check-ins, ready for
 * charting. Input is expected newest-first (the storage convention).
 */
export function buildTrend(checkIns: CheckIn[], days = 7): TrendPoint[] {
  return checkIns
    .slice(0, days)
    .slice()
    .reverse()
    .map((c) => ({
      date: c.createdAt,
      label: shortDayLabel(c.createdAt),
      mood: MOOD_SCORE[c.mood],
      stress: c.stressLevel,
      energy: c.energyLevel,
      studyPressure: c.studyPressure,
    }));
}

export type TriggerCount = { trigger: string; count: number };

/**
 * Most common triggers across the period. Combines AI-detected triggers (when
 * reflections exist) with the user's own check-in tags, so the view is useful
 * immediately and richer once reflections accumulate.
 */
export function commonTriggers(
  checkIns: CheckIn[],
  reflections: AIReflection[],
  topN = 5,
): TriggerCount[] {
  const counts = new Map<string, number>();
  const bump = (label: string) =>
    counts.set(label, (counts.get(label) ?? 0) + 1);

  for (const r of reflections) r.detectedTriggers.forEach(bump);
  for (const c of checkIns) c.tags.forEach(bump);

  return [...counts.entries()]
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count || a.trigger.localeCompare(b.trigger))
    .slice(0, topN);
}

export function averageStress(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;
  const sum = checkIns.reduce((acc, c) => acc + c.stressLevel, 0);
  return Math.round((sum / checkIns.length) * 10) / 10;
}

export type MoodDirection = "up" | "down" | "steady";

/** Compare the first and second halves of the mood series for a direction. */
export function moodDirection(trend: TrendPoint[]): MoodDirection {
  if (trend.length < 2) return "steady";
  const mid = Math.floor(trend.length / 2);
  const firstHalf = trend.slice(0, mid);
  const secondHalf = trend.slice(mid);
  const avg = (xs: TrendPoint[]) =>
    xs.reduce((a, p) => a + p.mood, 0) / xs.length;
  const delta = avg(secondHalf) - avg(firstHalf);
  if (delta > 0.3) return "up";
  if (delta < -0.3) return "down";
  return "steady";
}

/** A short, supportive, non-diagnostic summary generated from the data. */
export function weeklySummary(
  checkIns: CheckIn[],
  reflections: AIReflection[],
): string {
  if (checkIns.length === 0) {
    return "Once you log a few check-ins, MindMate will gently summarise the patterns it notices here.";
  }
  const trend = buildTrend(checkIns);
  const dir = moodDirection(trend);
  const avg = averageStress(checkIns.slice(0, 7));
  const top = commonTriggers(checkIns, reflections, 1)[0];

  const dirPhrase =
    dir === "up"
      ? "your mood has been lifting a little"
      : dir === "down"
        ? "your mood has dipped recently"
        : "your mood has stayed fairly steady";

  const triggerPhrase = top
    ? ` ${top.trigger} came up most often.`
    : "";

  return `Over your last ${Math.min(checkIns.length, 7)} check-ins, ${dirPhrase}, with stress averaging ${avg}/10.${triggerPhrase} This is a reflection, not a diagnosis — be gentle with yourself.`;
}

export type HabitSuggestion = { title: string; reason: string };

/** Recommend one small next habit, derived from the dominant weekly signal. */
export function recommendedHabit(checkIns: CheckIn[]): HabitSuggestion {
  if (checkIns.length === 0) {
    return {
      title: "A short daily check-in",
      reason: "A minute a day helps patterns become visible.",
    };
  }
  const recent = checkIns.slice(0, 7);
  const poorSleep = recent.filter((c) => c.sleepQuality === "POOR").length;
  const tagCount = (tag: CheckInTag) =>
    recent.filter((c) => c.tags.includes(tag)).length;
  const avgStress = averageStress(recent);

  if (poorSleep >= Math.ceil(recent.length / 2)) {
    return {
      title: "A gentle wind-down before bed",
      reason: "Sleep looked disrupted on several days this week.",
    };
  }
  if (tagCount("Comparison") >= 2) {
    return {
      title: "A one-line 'today's only job' each morning",
      reason: "Comparison came up more than once — a daily focus can quiet it.",
    };
  }
  if (tagCount("Focus Issue") >= 2) {
    return {
      title: "One 20-minute focus block, then a real break",
      reason: "Focus felt hard on a few days — small blocks rebuild momentum.",
    };
  }
  if (avgStress >= 7) {
    return {
      title: "A 2-minute breathing pause once a day",
      reason: "Average stress was high this week — small resets add up.",
    };
  }
  return {
    title: "Keep your steady daily check-in",
    reason: "You're tracking consistently — that's the habit that powers the rest.",
  };
}

/** Coping strategies surfaced in this week's reflections, deduped. */
export function strategiesToLeanOn(
  reflections: AIReflection[],
  limit = 3,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of reflections) {
    const s = r.copingStrategy.trim();
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
    if (out.length >= limit) break;
  }
  return out;
}
