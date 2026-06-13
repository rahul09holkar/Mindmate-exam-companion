import type { CheckIn, ReflectionContent } from "@/lib/types";
import { reflectionContentSchema } from "@/lib/validation/reflection-schema";
import { SYSTEM_PROMPT, buildUserPrompt, type AnalyzeContext } from "./prompt-templates";
import { mockAnalyze } from "./mock-analyzer";

/**
 * Server-side AI client (OpenAI). Generates a structured reflection and falls
 * back to the deterministic mock whenever no key is configured or a real call
 * fails — so the product always responds, and the API key never leaves the
 * server.
 *
 * IMPORTANT: only read non-public env vars here. Never expose keys to the client.
 */

export function isMockMode(): boolean {
  return !process.env.OPENAI_API_KEY;
}

/** Extract the first JSON object from a model text response. */
function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function callOpenAI(checkIn: CheckIn, context: AnalyzeContext): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No API key");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      temperature: 0.7,
      // JSON mode: the model is constrained to emit a single valid JSON object.
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(checkIn, context) },
      ],
    }),
    // Bound the wait so a slow provider can't hang the request.
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`Provider responded ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return text;
}

/**
 * Free-text chat completion against OpenAI. Used by the companion chat. The
 * caller is responsible for the mock fallback (chat has its own mock voice).
 */
export async function openAIChat(
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No API key");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      temperature: 0.8,
      messages: [{ role: "system", content: systemPrompt }, ...history],
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`Provider responded ${res.status}`);
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return text.trim();
}

/**
 * Generate a reflection for a check-in. Validates real provider output against
 * the reflection schema; any failure degrades gracefully to the mock.
 */
export async function generateReflection(
  checkIn: CheckIn,
  context: AnalyzeContext = {},
): Promise<ReflectionContent> {
  if (isMockMode()) {
    return mockAnalyze(checkIn, context);
  }
  try {
    const text = await callOpenAI(checkIn, context);
    const parsed = reflectionContentSchema.safeParse(extractJson(text));
    if (!parsed.success) {
      // Don't surface raw model output; fall back to a safe, valid reflection.
      return mockAnalyze(checkIn, context);
    }
    return parsed.data;
  } catch {
    return mockAnalyze(checkIn, context);
  }
}
