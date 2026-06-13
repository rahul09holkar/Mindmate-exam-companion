import { z } from "zod";
import { EXAM_TYPES, STUDY_PHASES, PREFERRED_TONES } from "@/lib/types";

/**
 * Request body for POST /api/chat. The client supplies the conversation plus a
 * small, non-sensitive context object assembled from local storage. No
 * user/profile IDs are accepted — the server never trusts client identity.
 */
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
  context: z
    .object({
      preferredTone: z.enum(PREFERRED_TONES).optional(),
      examType: z.enum(EXAM_TYPES).optional(),
      studyPhase: z.enum(STUDY_PHASES).optional(),
      recentTriggers: z.array(z.string().trim().max(80)).max(10).optional(),
      recentPattern: z.string().trim().max(600).optional(),
    })
    .optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatContext = NonNullable<ChatRequest["context"]>;
