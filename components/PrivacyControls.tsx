"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getStorage } from "@/lib/storage";
import { useHydrated } from "@/lib/hooks/useHydrated";

/**
 * Data controls: a plain-language note on AI usage, an export, and a delete.
 * All data lives locally on this device; deletion is immediate and complete.
 */
export function PrivacyControls() {
  const hydrated = useHydrated();
  const [counts, setCounts] = useState({ checkIns: 0, reflections: 0, hasProfile: false });
  const [deleted, setDeleted] = useState(false);

  function refresh() {
    const s = getStorage();
    setCounts({
      checkIns: s.listCheckIns().length,
      reflections: s.listReflections().length,
      hasProfile: s.getProfile() !== null,
    });
  }

  useEffect(() => {
    if (hydrated) refresh();
  }, [hydrated]);

  function handleExport() {
    const bundle = getStorage().exportAll();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindmate-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete() {
    const ok = window.confirm(
      "Delete all your MindMate data on this device? This can't be undone.",
    );
    if (!ok) return;
    getStorage().clearAll();
    setDeleted(true);
    refresh();
  }

  return (
    <div className="space-y-4">
      <Card as="section">
        <h2 className="text-base font-semibold text-ink">How your data is used</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-soft">
          <li>
            Your check-ins, reflections, and profile are stored{" "}
            <strong>only on this device</strong> (in your browser).
          </li>
          <li>
            When AI analysis is enabled, your journal text is sent to the AI
            provider <strong>only to generate your reflection</strong>, from our
            server — your data is not used to train models by us.
          </li>
          <li>
            In mock mode, nothing leaves your device at all.
          </li>
          <li>Your conversations with the companion are never saved.</li>
        </ul>
      </Card>

      <Card as="section">
        <h2 className="text-base font-semibold text-ink">Your data</h2>
        {hydrated ? (
          <p className="mt-1 text-sm text-ink-soft">
            {counts.hasProfile ? "Profile saved" : "No profile"} ·{" "}
            {counts.checkIns} check-in{counts.checkIns === 1 ? "" : "s"} ·{" "}
            {counts.reflections} reflection
            {counts.reflections === 1 ? "" : "s"}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3">
          <Button variant="secondary" onClick={handleExport}>
            Export my data (JSON)
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelete}
            className="border-alert/40 text-alert hover:bg-alert/5"
          >
            Delete all my data
          </Button>
        </div>

        {deleted ? (
          <p role="status" className="mt-3 text-sm font-medium text-brand-dark">
            Your data has been deleted from this device.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
