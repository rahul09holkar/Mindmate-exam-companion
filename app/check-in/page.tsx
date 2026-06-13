import { PageHeader } from "@/components/PageHeader";
import { CheckInForm } from "@/components/CheckInForm";

export default function CheckInPage() {
  return (
    <div>
      <PageHeader
        title="Daily check-in"
        description="How are you today? There are no wrong answers."
      />
      <CheckInForm />
    </div>
  );
}
