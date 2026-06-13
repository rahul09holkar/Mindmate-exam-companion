import { describe, it, expect } from "vitest";
import { getClientIp, isPayloadTooLarge } from "./request";

function reqWith(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { method: "POST", headers });
}

describe("getClientIp", () => {
  it("uses the first hop of x-forwarded-for", () => {
    const ip = getClientIp(reqWith({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }));
    expect(ip).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(reqWith({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("returns a sentinel when no IP headers are present", () => {
    expect(getClientIp(reqWith({}))).toBe("unknown");
  });
});

describe("isPayloadTooLarge", () => {
  it("is true when content-length exceeds the max", () => {
    expect(isPayloadTooLarge(reqWith({ "content-length": "5000" }), 1000)).toBe(true);
  });

  it("is false at or under the max", () => {
    expect(isPayloadTooLarge(reqWith({ "content-length": "1000" }), 1000)).toBe(false);
  });

  it("is false when content-length is missing or invalid", () => {
    expect(isPayloadTooLarge(reqWith({}), 1000)).toBe(false);
    expect(isPayloadTooLarge(reqWith({ "content-length": "nope" }), 1000)).toBe(false);
  });
});
