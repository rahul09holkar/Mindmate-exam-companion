import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";
import { analyzeLimiter } from "@/lib/security/limiters";

function req(body: unknown): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// Reset the shared limiter so request counts don't leak between tests.
beforeEach(() => analyzeLimiter.reset());

const validCheckIn = {
  id: "c1",
  createdAt: "2026-06-13T00:00:00Z",
  mood: "LOW",
  stressLevel: 7,
  energyLevel: 4,
  sleepQuality: "POOR",
  studyPressure: 8,
  journalText: "My mock test went badly and my parents asked about my rank.",
  tags: ["Mock Test"],
};

describe("POST /api/analyze", () => {
  it("returns 400 for malformed JSON", async () => {
    const res = await POST(req("not json"));
    expect(res.status).toBe(400);
  });

  it("returns 422 for invalid input", async () => {
    const res = await POST(req({ checkIn: { ...validCheckIn, stressLevel: 99 } }));
    expect(res.status).toBe(422);
  });

  it("returns a structured reflection (mock mode) for a valid check-in", async () => {
    const res = await POST(req({ checkIn: validCheckIn }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reflection.detectedTriggers).toContain("Mock test performance");
    expect(["LOW", "MODERATE", "HIGH"]).toContain(data.reflection.riskLevel);
  });

  it("routes crisis content to CRISIS without advice", async () => {
    const res = await POST(
      req({ checkIn: { ...validCheckIn, journalText: "I want to end my life." } }),
    );
    const data = await res.json();
    expect(data.reflection.riskLevel).toBe("CRISIS");
    expect(data.reflection.detectedTriggers).toHaveLength(0);
  });

  it("rate-limits after the per-IP budget is exhausted", async () => {
    // Drain the budget (analyzeLimiter is 10/min), then expect a 429.
    for (let i = 0; i < 10; i++) {
      const ok = await POST(req({ checkIn: validCheckIn }));
      expect(ok.status).toBe(200);
    }
    const blocked = await POST(req({ checkIn: validCheckIn }));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });

  it("rejects an oversized payload with 413", async () => {
    // The guard reads content-length before parsing; set it explicitly since
    // undici's Request doesn't populate it for a string body in the test env.
    const oversized = new Request("http://localhost/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "40000" },
      body: JSON.stringify({ checkIn: validCheckIn }),
    });
    const res = await POST(oversized);
    expect(res.status).toBe(413);
  });
});
