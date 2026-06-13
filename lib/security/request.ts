/**
 * Small, pure helpers for inspecting an incoming request at the API boundary.
 * Kept side-effect free so they are trivially unit-testable and never read the
 * request body (so journal/chat content is never touched here).
 */

/**
 * Best-effort client IP for rate-limiting. Reads the first hop of
 * `x-forwarded-for`, then `x-real-ip`, falling back to a sentinel so a missing
 * header degrades to a shared bucket rather than throwing.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

/**
 * True if the declared `Content-Length` exceeds `maxBytes`. A cheap guard that
 * rejects oversized payloads before the body is parsed — defense above the
 * per-field length bounds already enforced by Zod. A missing/invalid header is
 * treated as not-too-large (the body parse + Zod still bound the actual size).
 */
export function isPayloadTooLarge(request: Request, maxBytes: number): boolean {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const length = Number(raw);
  if (!Number.isFinite(length)) return false;
  return length > maxBytes;
}
