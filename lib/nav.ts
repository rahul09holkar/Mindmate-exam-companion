/** Primary navigation destinations shown in the bottom tab bar (mobile-first). */
export type NavItem = {
  href: string;
  label: string;
  /** Inline SVG path data for a simple, recognisable icon. */
  icon: string;
};

export const PRIMARY_NAV: NavItem[] = [
  {
    href: "/check-in",
    label: "Check-in",
    icon: "M12 4v16m8-8H4",
  },
  {
    href: "/dashboard",
    label: "Patterns",
    icon: "M4 19V5m6 14V9m6 10v-6m4 6V7",
  },
  {
    href: "/support",
    label: "Support",
    icon: "M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z",
  },
  {
    href: "/chat",
    label: "Companion",
    icon: "M4 5h16v11H7l-3 3V5z",
  },
];

/** Routes where the persistent bottom nav is hidden to keep the screen calm. */
export const NAV_HIDDEN_ROUTES = new Set<string>(["/", "/safety", "/onboarding"]);
