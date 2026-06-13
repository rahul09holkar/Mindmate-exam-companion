"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { InsightCard } from "@/components/reflection/InsightCard";
import { WeeklyTrendChart } from "@/components/WeeklyTrendChart";
import { getStorage } from "@/lib/storage";
import { seedDemoData } from "@/lib/storage/seed";
import { useHydrated } from "@/lib/hooks/useHydrated";
import type { AIReflection, CheckIn } from "@/lib/types";
import {
  buildTrend,
  commonTriggers,
  recommendedHabit,
  strategiesToLeanOn,
  weeklySummary,
  MOOD_SCORE_LABELS,
  type TrendPoint,
} from "@/lib/utils/analytics";

export function DashboardView() {
  const hydrated = useHydrated();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [reflections, setReflections] = useState<AIReflection[]>([]);

  const load = useCallback(() => {
    const storage = getStorage();
    setCheckIns(storage.listCheckIns());
    setReflections(storage.listReflections());
  }, []);

  useEffect(() => {
    if (hydrated) load();
  }, [hydrated, load]);

  function loadSampleData() {
    seedDemoData(getStorage(), { force: true });
    load();
  }

  if (!hydrated) {
    return <Card aria-busy="true">Loading your patterns…</Card>;
  }

  if (checkIns.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-ink-soft">
          Your weekly patterns will appear here once you&apos;ve checked in.
          Even one entry is a good start.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <ButtonLink href="/check-in">Start your first check-in</ButtonLink>
          <Button variant="secondary" onClick={loadSampleData}>
            Explore with sample data
          </Button>
        </div>
      </Card>
    );
  }

  const trend: TrendPoint[] = buildTrend(checkIns);
  const triggers = commonTriggers(checkIns, reflections);
  const habit = recommendedHabit(checkIns);
  const strategies = strategiesToLeanOn(reflections);
  const summary = weeklySummary(checkIns, reflections);

  return (
    <div className="space-y-4">
      <InsightCard title="This week, gently summarised" icon="🪞" emphasis>
        <p>{summary}</p>
      </InsightCard>

      <Card as="section">
        <WeeklyTrendChart
          data={trend}
          dataKey="mood"
          title="Mood trend"
          max={5}
          color="#3f7e74"
          formatValue={(v) => MOOD_SCORE_LABELS[Math.round(v)] ?? `${v}`}
        />
      </Card>

      <Card as="section">
        <WeeklyTrendChart
          data={trend}
          dataKey="stress"
          title="Stress trend"
          max={10}
          color="#c77d2e"
        />
      </Card>

      <InsightCard title="Common triggers" icon="🔍">
        {triggers.length === 0 ? (
          <p>No recurring triggers stood out yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {triggers.map((t) => (
              <li
                key={t.trigger}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-sm text-ink"
              >
                {t.trigger}
                <span
                  className="rounded-full bg-brand-soft px-1.5 text-xs font-semibold text-brand-dark"
                  aria-label={`appeared ${t.count} times`}
                >
                  {t.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </InsightCard>

      <InsightCard title="What you can lean on" icon="🌱">
        {strategies.length === 0 ? (
          <p>
            Strategies from your reflections will collect here.{" "}
            <Link
              href="/support"
              className="font-medium text-brand-dark underline underline-offset-2"
            >
              Explore the support toolkit
            </Link>{" "}
            any time.
          </p>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            {strategies.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
      </InsightCard>

      <InsightCard title="A small next habit" icon="🎯">
        <p className="font-medium text-ink">{habit.title}</p>
        <p className="mt-1 text-sm">{habit.reason}</p>
      </InsightCard>

      <div className="flex flex-col gap-3 pt-2">
        <ButtonLink href="/check-in">New check-in</ButtonLink>
        <Link
          href="/privacy"
          className="text-center text-sm font-medium text-ink-soft hover:text-ink"
        >
          Manage your data &amp; privacy
        </Link>
      </div>
    </div>
  );
}
