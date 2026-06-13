import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";
import { chatLimiter } from "@/lib/security/limiters";

function req(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// Reset the shared limiter so request counts don't leak between tests.
beforeEach(() => chatLimiter.reset());

describe("POST /api/chat", () => {
  it("returns 400 for malformed JSON", async () => {
    const res = await POST(req("not json"));
    expect(res.status).toBe(400);
  });

  it("returns 422 when messages are missing", async () => {
    const res = await POST(req({ messages: [] }));
    expect(res.status).toBe(422);
  });

  it("flags crisis content and signals routing to safety", async () => {
    const res = await POST(
      req({ messages: [{ role: "user", content: "I want to hurt myself" }] }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.crisis).toBe(true);
  });

  it("replies to ordinary stress without crisis (mock mode)", async () => {
    const res = await POST(
      req({ messages: [{ role: "user", content: "I can't focus today" }] }),
    );
    const data = await res.json();
    expect(data.crisis).toBe(false);
    expect(data.reply.length).toBeGreaterThan(0);
  });

  it("rate-limits after the per-IP budget is exhausted", async () => {
    const msg = { messages: [{ role: "user", content: "I can't focus today" }] };
    // Drain the budget (chatLimiter is 20/min), then expect a 429.
    for (let i = 0; i < 20; i++) {
      const ok = await POST(req(msg));
      expect(ok.status).toBe(200);
    }
    const blocked = await POST(req(msg));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });

  it("rejects an oversized payload with 413", async () => {
    // The guard reads content-length before parsing; set it explicitly since
    // undici's Request doesn't populate it for a string body in the test env.
    const oversized = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "80000" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });
    const res = await POST(oversized);
    expect(res.status).toBe(413);
  });
});
