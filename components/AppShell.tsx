import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  children: ReactNode;
};

/**
 * Mobile-first layout frame: a centered content column with a persistent
 * bottom navigation. Bottom padding leaves room for the fixed tab bar.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-app flex-col bg-canvas">
      <main
        id="main-content"
        className={cn("flex-1 px-5 pb-28 pt-6 sm:px-6")}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
