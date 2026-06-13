import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader
        title="Your data & privacy"
        description="You stay in control of what you share."
        backHref="/dashboard"
        backLabel="Patterns"
      />
      <Card>
        <p className="text-ink-soft">
          A plain-language explanation of how AI is used, plus delete-data and
          export-data controls, arrive in Pass 7.
        </p>
      </Card>
    </div>
  );
}
