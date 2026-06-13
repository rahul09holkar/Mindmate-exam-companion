import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { ReflectionView } from "@/components/ReflectionView";

export default function ReflectionPage() {
  return (
    <div>
      <PageHeader
        title="Your reflection"
        description="A gentle read on today — this is not a diagnosis."
        backHref="/check-in"
        backLabel="Check-in"
      />
      <Suspense
        fallback={
          <Card aria-busy="true" className="text-center text-ink-soft">
            Preparing your reflection…
          </Card>
        }
      >
        <ReflectionView />
      </Suspense>
    </div>
  );
}
