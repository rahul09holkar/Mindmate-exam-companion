import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/validation/analyze-schema";
import { analyzeCheckIn } from "@/lib/ai/journal-analyzer";
import { analyzeLimiter, MAX_ANALYZE_BYTES } from "@/lib/security/limiters";
import { getClientIp, isPayloadTooLarge } from "@/lib/security/request";

/**
 * Server boundary for journal analysis. Validates the request, runs the
 * safety + analysis pipeline server-side (where any AI key stays), and returns
 * the structured reflection. Errors return a safe, generic message — never a
 * stack trace — and raw journal text is never logged.
 *
 * Abuse protection runs before any parsing: an oversized body is rejected and
 * requests are rate-limited per IP, since this endpoint proxies a paid LLM key.
 */
export async function POST(request: Request) {
  if (isPayloadTooLarge(request, MAX_ANALYZE_BYTES)) {
    return NextResponse.json({ error: "That request is too large." }, { status: 413 });
  }

  const rl = analyzeLimiter.check(getClientIp(request));
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error:
          "You're sending check-ins very quickly — please take a breath and try again in a moment.",
      },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Your check-in could not be validated." },
      { status: 422 },
    );
  }

  try {
    const { checkIn, context } = parsed.data;
    const reflection = await analyzeCheckIn(checkIn, context);
    return NextResponse.json({ reflection });
  } catch {
    // Log a non-sensitive marker only — never the journal contents.
    console.error("analyze: pipeline error");
    return NextResponse.json(
      { error: "We couldn't complete your reflection right now." },
      { status: 500 },
    );
  }
}
