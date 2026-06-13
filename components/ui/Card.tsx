import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

/** Soft, card-based surface used across all screens. */
export function Card({ children, className, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-line bg-surface p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
