import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

type InsightCardProps = {
  title: string;
  /** Emoji/glyph shown beside the title (decorative). */
  icon: string;
  children: ReactNode;
  /** Highlight the hero insight (the hidden-pattern hypothesis). */
  emphasis?: boolean;
};

/** Titled section card used to present each part of a reflection. */
export function InsightCard({ title, icon, children, emphasis }: InsightCardProps) {
  return (
    <Card
      as="section"
      className={cn(emphasis && "border-brand/40 bg-brand-soft/50")}
    >
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <span aria-hidden="true" className="text-lg">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-2 text-ink-soft">{children}</div>
    </Card>
  );
}
