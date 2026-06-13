"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** Global error boundary — shows a calm message, never a stack trace. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <Card className="text-center">
        <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
        <p className="mt-2 text-ink-soft">
          Your data is safe on this device. Please try again.
        </p>
        <Button className="mt-4" onClick={reset}>
          Try again
        </Button>
      </Card>
    </div>
  );
}
