import type { CheckIn, ReflectionContent } from "@/lib/types";
import { classifyRisk } from "./safety-classifier";
import { generateReflection } from "./ai-client";
import type { AnalyzeContext } from "./prompt-templates";

/**
 * Orchestrates the analysis pipeline:
 *   safety classifier → (crisis short-circuit | generate) → risk enforcement
 *
 * The safety classifier is authoritative for riskLevel. On CRISIS we never
 * call the model and never produce normal advice or diagnosis — we return a
 * minimal, supportive reflection that points the student to human support.
 */

function crisisReflection(): ReflectionContent {
  return {
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
}

export async function analyzeCheckIn(
  checkIn: CheckIn,
  context: AnalyzeContext = {},
): Promise<ReflectionContent> {
  const risk = classifyRisk({
    text: checkIn.journalText,
    stressLevel: checkIn.stressLevel,
    studyPressure: checkIn.studyPressure,
    mood: checkIn.mood,
  });

  // Crisis path: skip the model entirely.
  if (risk.isCrisis) {
    return crisisReflection();
  }

  const content = await generateReflection(checkIn, context);

  // Enforce the classifier's verdict — the model is never trusted to set risk.
  const riskLevel = risk.level;
  const safetyNotes =
    riskLevel === "HIGH"
      ? "Distress signals seem elevated. Consider talking to someone you trust, and remember support is available if things feel like too much."
      : content.safetyNotes;

  return { ...content, riskLevel, safetyNotes };
}
