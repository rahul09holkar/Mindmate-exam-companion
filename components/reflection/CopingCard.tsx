import { InsightCard } from "./InsightCard";

/** Presents the single small coping step suggested for today. */
export function CopingCard({ copingStrategy }: { copingStrategy: string }) {
  return (
    <InsightCard title="One small step" icon="🌱">
      <p>{copingStrategy}</p>
    </InsightCard>
  );
}
