import Link from "next/link";
import { Card } from "@/components/ui/Card";

/**
 * Crisis support screen. Kept deliberately short and calm — no AI analysis,
 * no diagnosis, and no claim that emergency services have been contacted.
 */
export default function SafetyPage() {
  return (
    <div className="flex min-h-[80vh] flex-col justify-center">
      <Card className="border-alert/30 bg-surface">
        <h1 className="text-2xl font-semibold text-ink">
          You deserve immediate human support.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          What you are feeling matters. Please reach out to a trusted person or
          emergency support now — you do not have to face this alone.
        </p>

        <div className="mt-6 space-y-3 rounded-xl bg-brand-soft/60 p-4 text-ink">
          <p className="font-medium">A few options right now:</p>
          <ul className="list-disc space-y-1 pl-5 text-ink-soft">
            <li>Call or message someone you trust.</li>
            <li>Contact a local emergency number or a crisis helpline.</li>
            <li>If you are in immediate danger, seek emergency help now.</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-ink-faint">
          MindMate is not an emergency service and cannot contact help on your
          behalf.
        </p>
      </Card>

      <Link
        href="/support"
        className="mt-6 text-center text-sm font-medium text-ink-soft hover:text-ink"
      >
        View calming exercises
      </Link>
    </div>
  );
}
