"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ButtonLink, Button } from "@/components/ui/Button";
import { ReflectionCard } from "@/components/reflection/ReflectionCard";
import { InsightCard } from "@/components/reflection/InsightCard";
import { TriggerChips } from "@/components/reflection/TriggerChips";
import { CopingCard } from "@/components/reflection/CopingCard";
import { MindfulnessExerciseCard } from "@/components/reflection/MindfulnessExerciseCard";
import { SafetyNotice } from "@/components/SafetyNotice";
import { getStorage } from "@/lib/storage";
import { postJson } from "@/lib/utils/api";
import { useHydrated } from "@/lib/hooks/useHydrated";
import type { AIReflection, CheckIn } from "@/lib/types";

type Status = "loading" | "ready" | "error" | "missing";

export function ReflectionView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();

  const [status, setStatus] = useState<Status>("loading");
  const [reflection, setReflection] = useState<AIReflection | null>(null);
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    const storage = getStorage();
    const requestedId = searchParams.get("c");
    const checkIn: CheckIn | null = requestedId
      ? storage.getCheckIn(requestedId)
      : (storage.listCheckIns()[0] ?? null);

    if (!checkIn) {
      setStatus("missing");
      return;
    }

    // Guard against React's double-invoked effects / re-renders.
    if (requestedFor.current === checkIn.id) return;
    requestedFor.current = checkIn.id;

    // Efficiency: reuse a stored reflection rather than calling the API again.
    const existing = storage.getReflectionByCheckIn(checkIn.id);
    if (existing) {
      if (existing.riskLevel === "CRISIS") {
        router.replace("/safety");
        return;
      }
      setReflection(existing);
      setStatus("ready");
      return;
    }

    void analyze(checkIn);

    async function analyze(ci: CheckIn) {
      setStatus("loading");
      const profile = storage.getProfile();
      try {
        const data = await postJson<{
          reflection: Omit<AIReflection, "id" | "checkinId" | "createdAt">;
        }>("/api/analyze", {
          checkIn: ci,
          context: profile
            ? {
                preferredTone: profile.preferredTone,
                examType: profile.examType,
                studyPhase: profile.studyPhase,
              }
            : undefined,
        });
        const saved = storage.saveReflection(ci.id, data.reflection);
        if (saved.riskLevel === "CRISIS") {
          router.replace("/safety");
          return;
        }
        setReflection(saved);
        setStatus("ready");
      } catch {
        // Allow a retry on the next mount.
        requestedFor.current = null;
        setStatus("error");
      }
    }
  }, [hydrated, searchParams, router]);

  if (status === "loading") {
    return (
      <Card aria-busy="true" className="text-center">
        <p className="text-ink-soft">Reading your check-in with care…</p>
      </Card>
    );
  }

  if (status === "missing") {
    return (
      <Card className="text-center">
        <p className="text-ink-soft">
          We couldn&apos;t find a check-in to reflect on yet.
        </p>
        <ButtonLink href="/check-in" className="mt-4">
          Start a check-in
        </ButtonLink>
      </Card>
    );
  }

  if (status === "error" || !reflection) {
    return (
      <Card className="text-center">
        <p className="text-ink-soft">
          We couldn&apos;t complete your reflection right now. Your check-in is
          saved — please try again.
        </p>
        <Button className="mt-4" onClick={() => router.refresh()}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ReflectionCard
        emotionalSummary={reflection.emotionalSummary}
        riskLevel={reflection.riskLevel}
      />

      <InsightCard title="What may be weighing on you" icon="🔍">
        <TriggerChips triggers={reflection.detectedTriggers} />
      </InsightCard>

      <InsightCard title="A possible pattern" icon="💡" emphasis>
        <p>{reflection.patternHypothesis}</p>
      </InsightCard>

      <CopingCard copingStrategy={reflection.copingStrategy} />
      <MindfulnessExerciseCard exercise={reflection.mindfulnessExercise} />

      <InsightCard title="A gentle reframe" icon="💬">
        <p>{reflection.motivationalReframe}</p>
      </InsightCard>

      {reflection.safetyNotes ? (
        <SafetyNotice message={reflection.safetyNotes} />
      ) : null}

      <div className="flex flex-col gap-3 pt-2">
        <ButtonLink href="/dashboard">See your weekly patterns</ButtonLink>
        <Link
          href="/support"
          className="text-center text-sm font-medium text-ink-soft hover:text-ink"
        >
          Explore the support toolkit
        </Link>
      </div>
    </div>
  );
}
