import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="flex-1">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand-dark">
          <span aria-hidden="true">🌱</span> MindMate
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink">
          A calm companion for the pressure of exam prep.
        </h1>
        <p className="mt-3 text-lg text-ink-soft">
          MindMate turns your daily mood and journaling into gentle insights —
          spotting hidden stress triggers and emotional patterns a normal
          tracker would miss.
        </p>

        <Card className="mt-6 bg-brand-soft/60">
          <p className="text-sm text-ink-soft">
            This is a wellness companion, <strong>not</strong> a medical or
            diagnostic tool, and not a replacement for a therapist. If you are
            in crisis, you deserve immediate human support.
          </p>
        </Card>
      </div>

      <div className="mt-8 space-y-3">
        <ButtonLink href="/onboarding" className="w-full">
          Begin onboarding
        </ButtonLink>
        <ButtonLink href="/check-in" variant="secondary" className="w-full">
          Start a check-in
        </ButtonLink>
      </div>
    </div>
  );
}
