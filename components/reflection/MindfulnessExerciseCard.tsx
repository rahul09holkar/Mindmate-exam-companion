import { InsightCard } from "./InsightCard";

/**
 * Presents the 2-minute mindfulness exercise. An exercise written as
 * "Intro: 1) … 2) … 3) …" is shown as an intro line plus an ordered list.
 */
export function MindfulnessExerciseCard({ exercise }: { exercise: string }) {
  const match = exercise.match(/^(.*?)(\d\).*)$/s);

  if (!match) {
    return (
      <InsightCard title="A 2-minute reset" icon="🫁">
        <p>{exercise}</p>
      </InsightCard>
    );
  }

  const intro = match[1].trim().replace(/[:\s]+$/, "");
  const steps = match[2]
    .split(/\s(?=\d\))/)
    .map((s) => s.replace(/^\d\)\s*/, "").trim())
    .filter(Boolean);

  return (
    <InsightCard title="A 2-minute reset" icon="🫁">
      {intro ? <p className="mb-2">{intro}</p> : null}
      <ol className="list-decimal space-y-1 pl-5">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </InsightCard>
  );
}
