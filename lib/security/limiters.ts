import { createRateLimiter } from "./rate-limit";

/**
 * Per-IP rate limiters for the unauthenticated AI endpoints, which proxy a paid
 * LLM key. These are module-level singletons so their windows persist across
 * requests within a server instance.
 *
 * Analysis is the heavier operation, so it gets the tighter budget; the chat
 * companion allows more frequent, lighter turns.
 */

const MINUTE = 60_000;

/** POST /api/analyze — 10 reflections per minute per IP. */
export const analyzeLimiter = createRateLimiter({ limit: 10, windowMs: MINUTE });

/** POST /api/chat — 20 messages per minute per IP. */
export const chatLimiter = createRateLimiter({ limit: 20, windowMs: MINUTE });

/** Max accepted request body sizes (bytes), guarded before parsing. */
export const MAX_ANALYZE_BYTES = 32_000;
export const MAX_CHAT_BYTES = 64_000;
