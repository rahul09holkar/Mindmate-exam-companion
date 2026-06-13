import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validation/chat-schema";
import { respondToChat } from "@/lib/ai/chat-companion";

/**
 * Server boundary for the companion chat. Validates the request, runs the
 * safety + reply pipeline server-side (where the AI key stays), and returns a
 * reply plus a crisis flag. Errors return a safe generic message — never a
 * stack trace — and message contents are never logged.
 */
export async function POST(request: Request) {
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
