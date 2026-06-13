import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type PageHeaderProps = {
  title: string;
  /** Short supporting line shown under the title. */
  description?: string;
  /** When set, shows a back link to this route. */
  backHref?: string;
  backLabel?: string;
  className?: string;
};

/**
 * Consistent screen header. The <h1> is the single page heading for
 * each route, which keeps the heading order predictable for screen readers.
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {backLabel}
        </Link>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {description ? (
        <p className="mt-1.5 text-ink-soft">{description}</p>
      ) : null}
    </header>
  );
}
