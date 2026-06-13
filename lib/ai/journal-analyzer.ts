import type { CheckIn, ReflectionContent } from "@/lib/types";
import { classifyRisk } from "./safety-classifier";
import { generateReflection } from "./ai-client";
import { CRISIS_REFLECTION, HIGH_RISK_SAFETY_NOTE } from "./safety-copy";
import type { AnalyzeContext } from "./prompt-templates";

/**
 * Orchestrates the analysis pipeline:
 *   safety classifier → (crisis short-circuit | generate) → risk enforcement
 *
 * The safety classifier is authoritative for riskLevel. On CRISIS we never
 * call the model and never produce normal advice or diagnosis — we return a
 * minimal, supportive reflection that points the student to human support.
 */

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
    return CRISIS_REFLECTION;
  }

  const content = await generateReflection(checkIn, context);

  // Enforce the classifier's verdict — the model is never trusted to set risk.
  const riskLevel = risk.level;
  const safetyNotes =
    riskLevel === "HIGH" ? HIGH_RISK_SAFETY_NOTE : content.safetyNotes;

  return { ...content, riskLevel, safetyNotes };
}
