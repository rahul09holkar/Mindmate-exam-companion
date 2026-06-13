import Link from "next/link";
import { Card } from "@/components/ui/Card";

type SafetyNoticeProps = {
  /** Supportive note shown to the student. */
  message: string;
};

/**
 * Gentle, non-alarming note shown when distress appears elevated (HIGH).
 * Crisis-level content is handled separately by routing to /safety.
 */
export function SafetyNotice({ message }: SafetyNoticeProps) {
  return (
    <Card as="section" className="border-warn/40 bg-warn/5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <span aria-hidden="true">🫂</span> A note of care
      </h2>
      <p className="mt-2 text-ink-soft">{message}</p>
      <Link
        href="/support"
        className="mt-3 inline-block font-medium text-brand-dark underline underline-offset-2"
      >
        Try a calming exercise
      </Link>
    </Card>
  );
}
