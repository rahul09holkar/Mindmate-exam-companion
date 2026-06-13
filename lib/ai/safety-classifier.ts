import type { Mood, RiskLevel } from "@/lib/types";

/**
 * Lightweight, deterministic safety classifier.
 *
 * Design stance: in a wellness context a false positive (gently over-offering
 * human support) is far safer than a false negative, so crisis matching is
 * deliberately broad and does not attempt clever negation handling.
 *
 * It returns a {@link RiskLevel}. CRISIS short-circuits the analysis pipeline
 * (no LLM call, no diagnosis, no normal advice) and routes the user to /safety.
 */

/** Phrases that indicate self-harm, suicide, or immediate danger. */
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)?\s+my\s?self\b/,
  /\bsuicid(e|al)\b/,
  /\bend(ing)?\s+(my|it)\s+(life|all)\b/,
  /\b(don'?t|do\s+not|never)\s+want(ing)?\s+to\s+(live|be\s+here)\b/,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living|life)\b/,
  /\b(want|wish)\s+(to|i\s+could)\s+die\b/,
  /\bbetter\s+off\s+(dead|without\s+me)\b/,
  /\bself[-\s]?harm\b/,
  /\b(hurt|harm|cut)(ing)?\s+my\s?self\b/,
  /\bcan'?t\s+(go\s+on|do\s+this\s+anymore)\b/,
  /\bend\s+my\s+life\b/,
];

/** Softer distress markers that raise (but do not max out) the risk level. */
const DISTRESS_PATTERNS: RegExp[] = [
  /\bhopeless\b/,
  /\bworthless\b/,
  /\bcan'?t\s+cope\b/,
  /\bbreaking\s+down\b/,
  /\bgiving\s+up\b/,
  /\bnothing\s+matters\b/,
  /\bpanic\b/,
  /\bcan'?t\s+breathe\b/,
];

export type RiskAssessment = {
  level: RiskLevel;
  isCrisis: boolean;
  /** Number of distress markers found (never the raw user text). */
  distressSignals: number;
};

type ClassifyInput = {
  text: string;
  stressLevel?: number;
  studyPressure?: number;
  mood?: Mood;
};

/**
 * Assess risk from the journal text plus optional numeric/mood signals.
 * The text is matched case-insensitively; only counts/flags are returned so
 * raw journal content is never surfaced for logging.
 */
export function classifyRisk({
  text,
  stressLevel,
  studyPressure,
  mood,
}: ClassifyInput): RiskAssessment {
  const normalized = text.toLowerCase();

  if (CRISIS_PATTERNS.some((re) => re.test(normalized))) {
    return { level: "CRISIS", isCrisis: true, distressSignals: 0 };
  }

  const distressSignals = DISTRESS_PATTERNS.filter((re) =>
    re.test(normalized),
  ).length;

  // Numeric pressure indicators (1–10) and a very low mood add weight.
  const highStress = (stressLevel ?? 0) >= 8 || (studyPressure ?? 0) >= 9;
  const lowMood = mood === "VERY_LOW" || mood === "LOW";

  let score = distressSignals;
  if (highStress) score += 1;
  if (lowMood) score += 1;

  let level: RiskLevel = "LOW";
  if (distressSignals >= 2 || (distressSignals >= 1 && (highStress || lowMood))) {
    level = "HIGH";
  } else if (score >= 1) {
    level = "MODERATE";
  }

  return { level, isCrisis: false, distressSignals };
}
