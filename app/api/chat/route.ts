import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validation/chat-schema";
import { respondToChat } from "@/lib/ai/chat-companion";
import { chatLimiter, MAX_CHAT_BYTES } from "@/lib/security/limiters";
import { getClientIp, isPayloadTooLarge } from "@/lib/security/request";

/**
 * Server boundary for the companion chat. Validates the request, runs the
 * safety + reply pipeline server-side (where the AI key stays), and returns a
 * reply plus a crisis flag. Errors return a safe generic message — never a
 * stack trace — and message contents are never logged.
 *
 * Abuse protection runs before any parsing: an oversized body is rejected and
 * requests are rate-limited per IP, since this endpoint proxies a paid LLM key.
 */
export async function POST(request: Request) {
  if (isPayloadTooLarge(request, MAX_CHAT_BYTES)) {
    return NextResponse.json({ error: "That request is too large." }, { status: 413 });
  }

  const rl = chatLimiter.check(getClientIp(request));
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "You're sending messages very quickly — please pause a moment and try again." },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Your message could not be validated." },
      { status: 422 },
    );
  }

  try {
    const { messages, context } = parsed.data;
    const result = await respondToChat(messages, context);
    return NextResponse.json(result);
  } catch {
    console.error("chat: pipeline error");
    return NextResponse.json(
      { error: "I couldn't reply just now. Please try again." },
      { status: 500 },
    );
  }
}
