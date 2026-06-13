import { z } from "zod";
import {
  MOODS,
  SLEEP_QUALITIES,
  CHECKIN_TAGS,
  LEVEL_MIN,
  LEVEL_MAX,
  type CheckInInput,
} from "@/lib/types";

/** A 1–10 integer slider value. */
const levelSchema = z
  .number({ message: "Please choose a value." })
  .int("Please choose a whole number.")
  .min(LEVEL_MIN, `Must be at least ${LEVEL_MIN}.`)
  .max(LEVEL_MAX, `Must be at most ${LEVEL_MAX}.`);

export const MAX_JOURNAL_LENGTH = 5000;

/**
 * Validates the daily check-in payload. The journal is required (it is the
 * core input the AI analyses) and length-bounded to keep requests efficient.
 */
export const checkInSchema = z.object({
  mood: z.enum(MOODS),
  stressLevel: levelSchema,
  energyLevel: levelSchema,
  sleepQuality: z.enum(SLEEP_QUALITIES),
  studyPressure: levelSchema,
  journalText: z
    .string()
    .trim()
    .min(1, "Add a few words about your day so we can reflect with you.")
    .max(MAX_JOURNAL_LENGTH, "That entry is a little long — please shorten it."),
  tags: z
    .array(z.enum(CHECKIN_TAGS))
    .max(CHECKIN_TAGS.length)
    .transform((arr) => Array.from(new Set(arr))),
}) satisfies z.ZodType<CheckInInput, z.ZodTypeDef, unknown>;

export type CheckInFormValues = z.infer<typeof checkInSchema>;
