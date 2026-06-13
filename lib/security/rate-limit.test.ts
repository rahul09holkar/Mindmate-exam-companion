import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit, then blocks", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    const third = limiter.check("a");
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("reports a positive retryAfterSeconds when blocked", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    limiter.check("a");
    const blocked = limiter.check("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("isolates separate keys", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    // A different key has its own budget.
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("reset() clears all windows", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    limiter.check("a");
    expect(limiter.check("a").allowed).toBe(false);
    limiter.reset();
    expect(limiter.check("a").allowed).toBe(true);
  });

  describe("with fake timers", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("starts a fresh window after the previous one expires", () => {
      const limiter = createRateLimiter({ limit: 1, windowMs: 1_000 });
      expect(limiter.check("a").allowed).toBe(true);
      expect(limiter.check("a").allowed).toBe(false);
      vi.advanceTimersByTime(1_001);
      expect(limiter.check("a").allowed).toBe(true);
    });
  });
});
