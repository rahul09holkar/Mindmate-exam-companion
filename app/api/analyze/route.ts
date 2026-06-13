import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/validation/analyze-schema";
import { analyzeCheckIn } from "@/lib/ai/journal-analyzer";

/**
 * Server boundary for journal analysis. Validates the request, runs the
 * safety + analysis pipeline server-side (where any AI key stays), and returns
 * the structured reflection. Errors return a safe, generic message — never a
 * stack trace — and raw journal text is never logged.
 */
export async function POST(request: Request) {
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
