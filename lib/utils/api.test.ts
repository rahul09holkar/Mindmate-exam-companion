import { describe, it, expect, afterEach, vi } from "vitest";
import { postJson, ApiError } from "./api";

afterEach(() => vi.unstubAllGlobals());

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("postJson", () => {
  it("returns the parsed JSON body on a 2xx response", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse({ reply: "hi", crisis: false }));
    vi.stubGlobal("fetch", fetchSpy);

    const data = await postJson<{ reply: string; crisis: boolean }>("/api/chat", {
      messages: [],
    });

    expect(data).toEqual({ reply: "hi", crisis: false });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws an ApiError carrying the server's safe message and status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "Please pause a moment." }, 429)),
    );

    const err = await postJson("/api/chat", {}).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    if (!(err instanceof ApiError)) throw err;
    expect(err.status).toBe(429);
    expect(err.message).toBe("Please pause a moment.");
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("502 Bad Gateway", { status: 502 })),
    );

    const err = await postJson("/api/chat", {}).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    if (!(err instanceof ApiError)) throw err;
    expect(err.status).toBe(502);
    expect(err.message).toMatch(/something went wrong/i);
  });
});
