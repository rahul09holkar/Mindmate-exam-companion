import { PageHeader } from "@/components/PageHeader";
import { OnboardingForm } from "@/components/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div>
      <PageHeader
        title="Set up your profile"
        description="A few details help MindMate tailor support to your exam journey. You can change these any time."
        backHref="/"
        backLabel="Home"
      />
      <OnboardingForm />
    </div>
  );
}
