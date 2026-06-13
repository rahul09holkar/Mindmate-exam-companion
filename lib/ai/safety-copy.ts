import type { ReflectionContent } from "@/lib/types";

/**
 * Single source of truth for safety- and boundary-critical copy.
 *
 * These strings are intentionally centralised: the crisis response and the
 * "not a diagnosis" boundary appear in more than one place (journal analysis,
 * companion chat, mock analyzer), and they must never drift apart or be edited
 * inconsistently. Change the wording here and every surface stays aligned.
 */

/** Boundary phrase appended to reflective summaries — never a clinical claim. */
export const NOT_A_DIAGNOSIS = "This is a reflection, not a diagnosis.";

/**
 * The reflection returned when the safety classifier detects crisis language.
 * No analysis, no advice, no diagnosis — only a supportive route to human help.
 */
export const CRISIS_REFLECTION: ReflectionContent = {
  emotionalSummary:
    "It sounds like you're carrying something very heavy right now, and what you're feeling matters.",
  detectedTriggers: [],
  patternHypothesis:
    "Right now the most important thing isn't analysis — it's that you're not alone with this.",
  copingStrategy:
    "Please reach out to a trusted person or emergency support now. You deserve immediate human support.",
  mindfulnessExercise:
    "If it helps while you reach out: place a hand on your chest and take three slow breaths.",
  motivationalReframe:
    "Asking for help is a strong and caring thing to do for yourself.",
  riskLevel: "CRISIS",
  safetyNotes:
    "Crisis language detected. The student should be routed to /safety and encouraged to contact a trusted person or emergency support immediately. MindMate is not an emergency service.",
};

/** The supportive, no-advice reply the companion sends on crisis language. */
export const CRISIS_CHAT_REPLY =
  "It sounds like you're carrying something really heavy right now, and I'm glad you said it. " +
  "I'm not able to give the kind of help you deserve in this moment — please reach out to someone you trust or contact emergency support now. You don't have to be alone with this.";

/** Note attached when distress signals are elevated but not at crisis level. */
export const HIGH_RISK_SAFETY_NOTE =
  "Distress signals seem elevated. Consider talking to someone you trust, and remember support is available if things feel like too much.";
