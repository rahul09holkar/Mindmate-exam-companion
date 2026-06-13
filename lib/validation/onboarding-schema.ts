import { z } from "zod";
import {
  EXAM_TYPES,
  STUDY_PHASES,
  PREFERRED_TONES,
  PRESSURE_SOURCES,
  type OnboardingInput,
} from "@/lib/types";

/**
 * Validates the onboarding form payload. Enum values are restricted to the
 * known option lists so arbitrary client-supplied strings are rejected.
 */
export const onboardingSchema = z.object({
  examType: z.enum(EXAM_TYPES),
  // Optional free-ish text (a date or a month label). Bounded to avoid abuse;
  // empty string is normalised to undefined.
  targetExamDate: z
    .string()
    .trim()
    .max(40, "That date looks too long.")
    .optional()
    .transform((v) => (v ? v : undefined)),
  studyPhase: z.enum(STUDY_PHASES),
  pressureSources: z
    .array(z.enum(PRESSURE_SOURCES))
    .max(PRESSURE_SOURCES.length)
    // De-duplicate to keep stored data tidy.
    .transform((arr) => Array.from(new Set(arr))),
  preferredTone: z.enum(PREFERRED_TONES),
}) satisfies z.ZodType<OnboardingInput, z.ZodTypeDef, unknown>;

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
