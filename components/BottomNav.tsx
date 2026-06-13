"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { PRIMARY_NAV, NAV_HIDDEN_ROUTES } from "@/lib/nav";

/**
 * Persistent mobile-first tab bar. Hidden on calm/standalone screens.
 * Accessible: <nav> landmark, current page marked with aria-current,
 * labels are always visible (never icon-only).
 */
export function BottomNav() {
  const pathname = usePathname();

  if (NAV_HIDDEN_ROUTES.has(pathname)) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app border-t border-line bg-surface/95 backdrop-blur"
    >
      <ul className="flex items-stretch justify-around">
        {PRIMARY_NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium",
                  active ? "text-brand-dark" : "text-ink-soft",
                )}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.25 : 1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
