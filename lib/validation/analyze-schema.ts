import { z } from "zod";
import { EXAM_TYPES, STUDY_PHASES, PREFERRED_TONES } from "@/lib/types";
import { checkInSchema } from "./checkin-schema";

/**
 * Request body for POST /api/analyze. We accept the check-in payload plus a
 * small, non-sensitive context object for personalisation. Crucially, no
 * user/profile IDs are accepted here — the server never trusts client identity.
 */
export const analyzeRequestSchema = z.object({
  // The check-in fields, plus the id assigned client-side (used only to key the
  // reflection in the response; not a trusted identity claim).
  checkIn: checkInSchema.extend({
    id: z.string().min(1).max(100),
    createdAt: z.string().min(1).max(40),
  }),
  context: z
    .object({
      preferredTone: z.enum(PREFERRED_TONES).optional(),
      examType: z.enum(EXAM_TYPES).optional(),
      studyPhase: z.enum(STUDY_PHASES).optional(),
    })
    .optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
