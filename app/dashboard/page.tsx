import { PageHeader } from "@/components/PageHeader";
import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Your weekly patterns"
        description="What's been shifting in your mood, stress, and triggers."
      />
      <DashboardView />
    </div>
  );
}
