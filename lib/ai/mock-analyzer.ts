import type { CheckIn, PreferredTone, ReflectionContent } from "@/lib/types";
import type { AnalyzeContext } from "./prompt-templates";

/**
 * Deterministic, offline "analyzer" used when no AI key is configured.
 *
 * It is intentionally rule-based but written to feel intelligent: it detects
 * the stress keywords exam students actually use, combines them with the
 * numeric mood signals, and assembles a coherent, tone-aware reflection —
 * including the hidden-pattern hypothesis that is the product's core value.
 *
 * Note: riskLevel/safetyNotes here are placeholders; the journal analyzer
 * overwrites them with the authoritative safety-classifier result.
 */

type TriggerRule = {
  /** Matches the lowercased journal text. */
  test: RegExp;
  trigger: string;
  /** Tags this rule into pattern detection buckets. */
  themes: Theme[];
};

type Theme = "performance" | "external" | "sleep" | "focus" | "comparison";

const RULES: TriggerRule[] = [
  {
    test: /\bmock\s*test|\bmock\b/,
    trigger: "Mock test performance",
    themes: ["performance"],
  },
  { test: /\brank\b/, trigger: "Pressure around rank", themes: ["performance", "external"] },
  {
    test: /\bparents?\b|\bfamily\b|\bmom\b|\bdad\b/,
    trigger: "Family expectations",
    themes: ["external"],
  },
  {
    test: /\bcan'?t\s+sleep|\bsleep\b|\binsomnia\b/,
    trigger: "Sleep disruption",
    themes: ["sleep"],
  },
  { test: /\btired|\bexhaust|\bdrained\b/, trigger: "Low energy / fatigue", themes: ["sleep"] },
  { test: /\bbacklog|\bpending|\bbehind\s+on\b/, trigger: "Study backlog", themes: ["performance"] },
  {
    test: /\bfail(ure|ing|ed)?\b|\bfalling\s+behind\b|\bnot\s+good\s+enough\b/,
    trigger: "Fear of falling behind",
    themes: ["performance"],
  },
  {
    test: /\bcompar(e|ing|ison)\b|\beveryone\s+else\b|\bothers?\s+are\b/,
    trigger: "Comparing with peers",
    themes: ["comparison"],
  },
  { test: /\bpanic|\banxious|\banxiety\b/, trigger: "Acute anxiety / panic", themes: ["focus"] },
  {
    test: /\bcan'?t\s+focus|\bdistract|\bconcentrat/,
    trigger: "Difficulty focusing",
    themes: ["focus"],
  },
];

/** Map check-in tags to additional triggers (deduped against keyword hits). */
const TAG_TRIGGERS: Record<string, string> = {
  "Mock Test": "Mock test performance",
  "Family Pressure": "Family expectations",
  Backlog: "Study backlog",
  Comparison: "Comparing with peers",
  "Exam Fear": "Fear about the exam",
  "Focus Issue": "Difficulty focusing",
};

function pickPattern(themes: Set<Theme>): string {
  if (themes.has("performance") && (themes.has("external") || themes.size > 1)) {
    return "It sounds like your sense of self-worth may be getting tied to your exam performance right now. That link is common under pressure — and it isn't the truth about who you are.";
  }
  if (themes.has("sleep")) {
    return "There may be a loop where stress is disturbing your sleep, and tiredness is making the stress harder to carry. Easing one side often softens the other.";
  }
  if (themes.has("comparison")) {
    return "Comparing your progress with others may be amplifying the pressure you feel, even when your own plan is on track.";
  }
  if (themes.has("focus")) {
    return "The harder you push to focus while anxious, the more focus can slip. Lowering the pressure first often helps it return.";
  }
  return "You may be carrying a steady, low-level pressure that builds quietly across the day rather than from any single cause.";
}

function copingFor(themes: Set<Theme>, tone: PreferredTone): string {
  const step = themes.has("performance")
    ? "pick one small, finishable task (say, 20 minutes on a single topic) and treat finishing it as the whole goal"
    : themes.has("sleep")
      ? "set a gentle wind-down: screens away 30 minutes before bed and a few slow breaths as you settle"
      : themes.has("focus")
        ? "try one 20-minute focus block with everything else out of sight, then a real break"
        : "name the single most pressing thing, and take just the first small step on it";

  const opener: Record<PreferredTone, string> = {
    GENTLE: "One small step could be to",
    DIRECT: "A clear next step:",
    MOTIVATIONAL: "Here's a win you can grab today —",
    PRACTICAL: "Concrete next step:",
  };
  return `${opener[tone]} ${step}.`;
}

function reframeFor(themes: Set<Theme>, tone: PreferredTone): string {
  const core = themes.has("performance")
    ? "One mock test is feedback, not a verdict on you. It shows where to look next — nothing about your worth."
    : themes.has("comparison")
      ? "Your timeline is your own. Someone else's pace says nothing about whether you'll get there."
      : "A hard day is information, not a final score. You're allowed to have one and still be on track.";

  if (tone === "MOTIVATIONAL") {
    return `${core} You've shown up today, and that counts.`;
  }
  return core;
}

const MINDFULNESS_EXERCISES: Record<Theme | "default", string> = {
  performance:
    "Try a 2-minute grounding pause: 1) Sit and unclench your jaw and shoulders. 2) Name 5 things you can see, 4 you can hear, 3 you can touch. 3) Take three slow breaths, longer on the out-breath.",
  sleep:
    "Try a 2-minute wind-down: 1) Dim the lights. 2) Breathe in for 4, out for 6, for one minute. 3) Let your next thought be one small thing that went okay today.",
  focus:
    "Try a 2-minute reset: 1) Close your eyes. 2) Breathe in for 4, hold for 4, out for 4. 3) Picture the one next task, then open your eyes and start just that.",
  comparison:
    "Try a 2-minute refocus: 1) Put your hand on your chest. 2) Take three slow breaths. 3) Finish the line 'today, my only job is ___' with one small thing.",
  external:
    "Try a 2-minute grounding pause: 1) Feel both feet on the floor. 2) Breathe in for 4, out for 6, three times. 3) Remind yourself: their worry is about love, not a measure of you.",
  default:
    "Try a 2-minute breathing pause: 1) Sit comfortably. 2) Breathe in for 4 and out for 6. 3) Repeat for one minute, letting your shoulders drop.",
};

function moodPhrase(checkIn: CheckIn): string {
  const intense = checkIn.stressLevel >= 8 || checkIn.studyPressure >= 8;
  if (checkIn.mood === "VERY_LOW" || checkIn.mood === "LOW") {
    return intense
      ? "It sounds like today has felt heavy, with a lot of pressure pressing in at once."
      : "It sounds like today has felt low, even if the pressure was manageable.";
  }
  if (checkIn.mood === "OKAY") {
    return intense
      ? "It sounds like you're holding steady, though there's real pressure under the surface."
      : "It sounds like a fairly steady day, neither especially hard nor light.";
  }
  return "It sounds like today felt okay — and noticing that is worth something too.";
}

/** Produce a structured reflection from a check-in, fully offline. */
export function mockAnalyze(
  checkIn: CheckIn,
  context: AnalyzeContext = {},
): ReflectionContent {
  const text = checkIn.journalText.toLowerCase();
  const tone = context.preferredTone ?? "GENTLE";

  const triggers = new Set<string>();
  const themes = new Set<Theme>();

  for (const rule of RULES) {
    if (rule.test.test(text)) {
      triggers.add(rule.trigger);
      rule.themes.forEach((t) => themes.add(t));
    }
  }
  for (const tag of checkIn.tags) {
    const t = TAG_TRIGGERS[tag];
    if (t) triggers.add(t);
  }
  // Sleep quality is a strong structured signal even without keywords.
  if (checkIn.sleepQuality === "POOR") {
    triggers.add("Sleep disruption");
    themes.add("sleep");
  }

  const detectedTriggers = Array.from(triggers).slice(0, 6);
  if (detectedTriggers.length === 0) {
    detectedTriggers.push("General exam-season pressure");
  }

  const primaryTheme: Theme | "default" =
    [...themes][0] ?? "default";

  return {
    emotionalSummary: `${moodPhrase(checkIn)} This is a reflection, not a diagnosis.`,
    detectedTriggers,
    patternHypothesis: pickPattern(themes),
    copingStrategy: copingFor(themes, tone),
    mindfulnessExercise:
      MINDFULNESS_EXERCISES[primaryTheme] ?? MINDFULNESS_EXERCISES.default,
    motivationalReframe: reframeFor(themes, tone),
    // Overwritten by the analyzer with the safety-classifier verdict.
    riskLevel: "LOW",
  };
}
