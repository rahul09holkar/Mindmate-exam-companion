import { describe, it, expect } from "vitest";
import { respondToChat, mockChatReply } from "./chat-companion";
import type { ChatMessage } from "@/lib/validation/chat-schema";

function user(content: string): ChatMessage {
  return { role: "user", content };
}

describe("mockChatReply", () => {
  it("responds to 'I panicked after a mock test' with reframe + grounding", () => {
    const reply = mockChatReply([user("I panicked after a mock test")]);
    expect(reply.toLowerCase()).toContain("feedback");
  });

  it("responds to 'I feel guilty taking a break' by normalising rest", () => {
    const reply = mockChatReply([user("I feel guilty taking a break")]);
    expect(reply.toLowerCase()).toContain("rest");
  });

  it("uses recent triggers when the message is vague", () => {
    const reply = mockChatReply([user("hi")], {
      recentTriggers: ["Sleep disruption"],
    });
    expect(reply.toLowerCase()).toContain("sleep disruption");
  });
});

describe("respondToChat", () => {
  it("routes crisis content to safety without giving advice", async () => {
    const result = await respondToChat([user("I want to end my life")]);
    expect(result.crisis).toBe(true);
    expect(result.reply.toLowerCase()).toContain("emergency support");
    // No coping/study advice in a crisis reply.
    expect(result.reply.toLowerCase()).not.toContain("20 minutes");
  });

  it("replies normally (mock mode) for ordinary stress", async () => {
    const result = await respondToChat([user("I can't focus today")]);
    expect(result.crisis).toBe(false);
    expect(result.reply.length).toBeGreaterThan(0);
  });
});
