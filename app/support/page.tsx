import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SupportToolCard } from "@/components/SupportToolCard";
import { Card } from "@/components/ui/Card";
import { SUPPORT_EXERCISES } from "@/lib/support-exercises";

export default function SupportPage() {
  return (
    <div>
      <PageHeader
        title="Support toolkit"
        description="Quick exercises you can use any time — no account or internet needed."
      />

      <div className="space-y-3">
        {SUPPORT_EXERCISES.map((exercise) => (
          <SupportToolCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      <Card className="mt-5 bg-brand-soft/50 text-sm text-ink-soft">
        If things ever feel like too much, you deserve real human support.{" "}
        <Link
          href="/safety"
          className="font-medium text-brand-dark underline underline-offset-2"
        >
          See crisis support
        </Link>
        .
      </Card>
    </div>
  );
}
