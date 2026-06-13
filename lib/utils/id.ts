/**
 * Generate a unique identifier. Prefers the platform crypto UUID and falls
 * back to a timestamp-based id only where crypto is unavailable.
 */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Current time as an ISO-8601 string. Centralised for easy testing/mocking. */
export function nowIso(): string {
  return new Date().toISOString();
}
