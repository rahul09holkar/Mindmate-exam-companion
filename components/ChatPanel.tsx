"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getStorage } from "@/lib/storage";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { sanitizeText } from "@/lib/utils/sanitize";
import { cn } from "@/lib/utils/cn";
import type { ChatContext, ChatMessage } from "@/lib/validation/chat-schema";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I'm MindMate. I'm here whenever you want to talk — no pressure, nothing to get right. What's on your mind today?",
};

const SUGGESTED_PROMPTS = [
  "I feel behind",
  "I panicked after a mock test",
  "I can't focus",
  "I feel guilty taking a break",
];

/** How many turns of history to send (keeps requests small and efficient). */
const HISTORY_LIMIT = 12;

export function ChatPanel() {
  const router = useRouter();
  const hydrated = useHydrated();

  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contextRef = useRef<ChatContext>({});
  const endRef = useRef<HTMLDivElement>(null);

  // Assemble personalisation context from local storage once on the client.
  useEffect(() => {
    if (!hydrated) return;
    const storage = getStorage();
    const profile = storage.getProfile();
    const latest = storage.listReflections()[0];
    contextRef.current = {
      preferredTone: profile?.preferredTone,
      examType: profile?.examType,
      studyPhase: profile?.studyPhase,
      recentTriggers: latest?.detectedTriggers,
      recentPattern: latest?.patternHypothesis,
    };
  }, [hydrated]);

  useEffect(() => {
    // Guarded: scrollIntoView is unavailable in some test environments (jsdom).
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages, loading]);

  async function send(rawText: string) {
    const text = sanitizeText(rawText);
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-HISTORY_LIMIT),
          context: contextRef.current,
        }),
      });
      if (!res.ok) throw new Error("Chat failed");
      const data = (await res.json()) as { reply: string; crisis: boolean };

      if (data.crisis) {
        router.push("/safety");
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError("I couldn't reply just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void send(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  }

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* Conversation log */}
      <div
        className="flex-1 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Conversation with MindMate"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <p
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 leading-relaxed",
                m.role === "user"
                  ? "bg-brand text-white"
                  : "border border-line bg-surface text-ink",
              )}
            >
              <span className="sr-only">
                {m.role === "user" ? "You said: " : "MindMate said: "}
              </span>
              {sanitizeText(m.content)}
            </p>
          </div>
        ))}

        {loading ? (
          <div className="flex justify-start">
            <p className="rounded-2xl border border-line bg-surface px-4 py-2.5 text-ink-soft">
              <span className="sr-only">MindMate is replying</span>
              <span aria-hidden="true">Thinking…</span>
            </p>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-alert">
          {error}
        </p>
      ) : null}

      {/* Suggested openers */}
      {showSuggestions ? (
        <div className="mt-4">
          <p className="mb-2 text-sm text-ink-soft">Not sure where to start?</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void send(prompt)}
                className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-brand/40 hover:text-ink"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Composer */}
      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="chat-input" className="sr-only">
          Message MindMate
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={2000}
            placeholder="Type a message…"
            className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-line bg-surface p-3 text-ink placeholder:text-ink-faint"
          />
          <Button type="submit" disabled={loading || !input.trim()} className="px-5">
            Send
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-ink-faint">
          MindMate is a supportive companion, not a therapist. This is not a
          diagnosis.
        </p>
      </form>
    </div>
  );
}
