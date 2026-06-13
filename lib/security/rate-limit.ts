/**
 * Minimal, dependency-free fixed-window rate limiter.
 *
 * Design mirrors the storage layer: a small in-memory implementation behind a
 * narrow interface, so it can later be swapped for a shared backend (e.g. Redis)
 * without touching call sites. State is per-server-instance — correct for the
 * single-instance MVP; a multi-instance deployment would need a shared store.
 *
 * The limiter is keyed by an opaque string (we pass the client IP). It never
 * sees journal or chat content.
 */

export type RateLimitResult = {
  allowed: boolean;
  /** Requests left in the current window (never negative). */
  remaining: number;
  /** Seconds until the window resets — suitable for a `Retry-After` header. */
  retryAfterSeconds: number;
};

export type RateLimiter = {
  check(key: string): RateLimitResult;
  /** Clear all windows. Used for test isolation. */
  reset(): void;
};

type Window = { count: number; resetAt: number };

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const windows = new Map<string, Window>();

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const existing = windows.get(key);

      // Start (or restart) the window if none exists or the old one expired.
      if (!existing || now >= existing.resetAt) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return {
          allowed: true,
          remaining: limit - 1,
          retryAfterSeconds: Math.ceil(windowMs / 1000),
        };
      }

      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      );

      if (existing.count >= limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }

      existing.count += 1;
      return {
        allowed: true,
        remaining: limit - existing.count,
        retryAfterSeconds,
      };
    },

    reset(): void {
      windows.clear();
    },
  };
}
