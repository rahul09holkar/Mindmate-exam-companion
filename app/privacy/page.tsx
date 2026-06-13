import { PageHeader } from "@/components/PageHeader";
import { PrivacyControls } from "@/components/PrivacyControls";

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader
        title="Your data & privacy"
        description="You stay in control of what you share."
        backHref="/dashboard"
        backLabel="Patterns"
      />
      <PrivacyControls />
    </div>
  );
}
