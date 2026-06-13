import type { SupportExercise } from "@/lib/support-exercises";
import { Card } from "@/components/ui/Card";

/**
 * An offline support exercise, presented as a native disclosure so it is
 * keyboard accessible and works without any JavaScript or AI call.
 */
export function SupportToolCard({ exercise }: { exercise: SupportExercise }) {
  const stepsId = `${exercise.id}-steps`;
  return (
    <Card as="article" className="p-0">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className="text-2xl">
            {exercise.icon}
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-ink">
              {exercise.title}
            </span>
            <span className="block text-sm text-ink-soft">
              {exercise.summary}
            </span>
          </span>
          <span className="flex items-center gap-2 text-sm text-ink-faint">
            {exercise.duration}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform group-open:rotate-180"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </summary>
        <ol
          id={stepsId}
          className="list-decimal space-y-2 border-t border-line px-5 py-4 pl-9 text-ink-soft"
        >
          {exercise.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </details>
    </Card>
  );
}
