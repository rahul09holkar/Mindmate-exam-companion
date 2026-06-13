import type { ChatContext, ChatMessage } from "@/lib/validation/chat-schema";
import { classifyRisk } from "./safety-classifier";
import { buildChatSystemPrompt } from "./prompt-templates";
import { isMockMode, openAIChat } from "./ai-client";

export type ChatResult = {
  reply: string;
  /** When true, the client should route the student to /safety. */
  crisis: boolean;
};

/** The supportive, non-advice message shown when crisis language is detected. */
const CRISIS_REPLY =
  "It sounds like you're carrying something really heavy right now, and I'm glad you said it. " +
  "I'm not able to give the kind of help you deserve in this moment — please reach out to someone you trust or contact emergency support now. You don't have to be alone with this.";

type Theme =
  | "behind"
  | "panic"
  | "focus"
  | "guilt"
  | "sleep"
  | "family"
  | "comparison";

const THEME_RULES: Array<{ test: RegExp; theme: Theme }> = [
  { test: /\bbehind\b|\bfalling\s+behind\b|\bnot\s+enough\b|\bcatch\s+up\b/, theme: "behind" },
  { test: /\bpanic|\bpanicked|\banxious|\banxiety|\bmock\b/, theme: "panic" },
  { test: /\bfocus|\bconcentrat|\bdistract/, theme: "focus" },
  { test: /\bguilt|\bbreak\b|\brest\b|\blazy\b/, theme: "guilt" },
  { test: /\bsleep|\btired|\bcan'?t\s+sleep/, theme: "sleep" },
  { test: /\bparents?\b|\bfamily\b|\brank\b/, theme: "family" },
  { test: /\bcompar|\beveryone\s+else\b|\bothers?\b/, theme: "comparison" },
];

const THEME_REPLIES: Record<Theme, string> = {
  behind:
    "It sounds like you're feeling behind, and that weight is real. Falling behind your own plan isn't the same as failing — it's information. One small step could be to pick just the next topic and give it 20 focused minutes. What feels like the most pressing thing right now?",
  panic:
    "It sounds like that really shook you. A mock test is feedback on your prep, not a verdict on you. Right now, slowing your breath — out longer than in — can settle the wave. What part is weighing on you most?",
  focus:
    "It sounds like focus has been slipping, which is so common when pressure is high. Pushing harder often makes it worse. One small step could be a single 20-minute block with everything else out of sight. Want to try framing one tiny task together?",
  guilt:
    "It sounds like resting is bringing up guilt. Rest isn't the opposite of studying — it's part of how your mind holds what you learn. You're allowed to take a break and still be serious about your goal. What would 'enough for today' look like?",
  sleep:
    "It sounds like sleep has been hard, and that makes everything heavier. A gentle wind-down — screens away, slow breaths, one small good thing from today — can help your mind let go. How have your nights been feeling?",
  family:
    "It sounds like the pressure from people around you is landing hard. Often that pressure comes from love, even when it doesn't feel supportive. Your worth isn't measured by a rank. What do you wish they understood right now?",
  comparison:
    "It sounds like comparing yourself to others is amplifying the pressure. Their pace says nothing about whether you'll get there. One small step could be a single line each morning: 'today, my only job is ___.' What would yours be today?",
};

const TONE_OPENERS: Record<NonNullable<ChatContext["preferredTone"]>, string> = {
  GENTLE: "I'm really glad you're here.",
  DIRECT: "Thanks for saying it plainly.",
  MOTIVATIONAL: "Thank you for showing up and sharing this.",
  PRACTICAL: "Okay, let's take this one step at a time.",
};

function detectTheme(text: string): Theme | null {
  const lower = text.toLowerCase();
  for (const rule of THEME_RULES) {
    if (rule.test.test(lower)) return rule.theme;
  }
  return null;
}

/** Deterministic, offline companion reply used when no AI key is configured. */
export function mockChatReply(
  messages: ChatMessage[],
  context: ChatContext = {},
): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = lastUser?.content ?? "";
  const theme = detectTheme(text);

  if (theme) return THEME_REPLIES[theme];

  const opener = context.preferredTone
    ? TONE_OPENERS[context.preferredTone]
    : TONE_OPENERS.GENTLE;
  const triggerNote = context.recentTriggers?.length
    ? ` You've mentioned ${context.recentTriggers[0].toLowerCase()} recently — we can start there if you'd like.`
    : "";

  return `${opener} It sounds like there's a lot on your mind. You don't have to have the right words — tell me what feels heaviest right now, and we'll take it one small step at a time.${triggerNote}`;
}

/**
 * Orchestrate a companion reply: safety-gate the latest user message, then
 * generate with the AI (or mock). On crisis we return a supportive message
 * with no advice and signal the client to route to /safety.
 */
export async function respondToChat(
  messages: ChatMessage[],
  context: ChatContext = {},
): Promise<ChatResult> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    const risk = classifyRisk({ text: lastUser.content });
    if (risk.isCrisis) {
      return { reply: CRISIS_REPLY, crisis: true };
    }
  }

  if (isMockMode()) {
    return { reply: mockChatReply(messages, context), crisis: false };
  }

  try {
    const reply = await openAIChat(buildChatSystemPrompt(context), messages);
    return { reply, crisis: false };
  } catch {
    return { reply: mockChatReply(messages, context), crisis: false };
  }
}
