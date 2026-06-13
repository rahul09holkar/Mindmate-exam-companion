import { z } from "zod";
import { RISK_LEVELS, type ReflectionContent } from "@/lib/types";

/**
 * Validates the structured reflection. Applied to BOTH mock output and any
 * real LLM output, so malformed/unsafe AI responses are rejected at the
 * boundary before they can reach persistence or the UI.
 */
export const reflectionContentSchema = z.object({
  emotionalSummary: z.string().trim().min(1).max(800),
  detectedTriggers: z.array(z.string().trim().min(1).max(80)).max(8),
  patternHypothesis: z.string().trim().min(1).max(600),
  copingStrategy: z.string().trim().min(1).max(800),
  mindfulnessExercise: z.string().trim().min(1).max(800),
  motivationalReframe: z.string().trim().min(1).max(600),
  riskLevel: z.enum(RISK_LEVELS),
  safetyNotes: z.string().trim().max(600).optional(),
}) satisfies z.ZodType<ReflectionContent, z.ZodTypeDef, unknown>;
