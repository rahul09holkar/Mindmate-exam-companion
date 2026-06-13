import { describe, it, expect } from "vitest";
import { POST } from "./route";

function req(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

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
});
