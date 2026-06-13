import type { ZodError } from "zod";

/**
 * Flatten a ZodError into a `{ field: firstMessage }` map for simple inline
 * display next to each form control.
 */
export function fieldErrors(error: ZodError): Record<string, string> {
  const flat = error.flatten().fieldErrors;
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages && messages.length > 0) out[key] = messages[0];
  }
  return out;
}
