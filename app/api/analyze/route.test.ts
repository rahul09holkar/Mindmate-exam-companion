import { describe, it, expect } from "vitest";
import { POST } from "./route";

function req(body: unknown): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

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
});
