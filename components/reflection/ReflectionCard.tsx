import { Card } from "@/components/ui/Card";
import type { RiskLevel } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";

type ReflectionCardProps = {
  emotionalSummary: string;
  riskLevel: RiskLevel;
};

/** Headline reflection card: the emotional summary and the risk indicator. */
export function ReflectionCard({ emotionalSummary, riskLevel }: ReflectionCardProps) {
  return (
    <Card as="section">
      <div className="mb-3">
        <RiskBadge level={riskLevel} />
      </div>
      <h2 className="sr-only">Emotional summary</h2>
      <p className="text-lg leading-relaxed text-ink">{emotionalSummary}</p>
    </Card>
  );
}
