import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/**
 * Risk indicator. Meaning is carried by an icon AND a text label (plus an
 * accessible label), never by colour alone. CRISIS is handled by routing to
 * /safety, so it is not expected to render here.
 */
const CONFIG: Record<RiskLevel, { label: string; icon: string; className: string }> = {
  LOW: {
    label: "Gentle day",
    icon: "🌿",
    className: "border-brand/30 bg-brand-soft text-brand-dark",
  },
  MODERATE: {
    label: "Worth noticing",
    icon: "🔶",
    className: "border-warn/40 bg-warn/10 text-warn",
  },
  HIGH: {
    label: "Be kind to yourself",
    icon: "🫂",
    className: "border-alert/40 bg-alert/10 text-alert",
  },
  CRISIS: {
    label: "Immediate support",
    icon: "🆘",
    className: "border-alert bg-alert/10 text-alert",
  },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { label, icon, className } = CONFIG[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
        className,
      )}
      aria-label={`Reflection tone: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
