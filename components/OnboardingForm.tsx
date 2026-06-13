"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OptionGroup } from "@/components/forms/OptionGroup";
import { ChipMultiSelect } from "@/components/forms/ChipMultiSelect";
import { FieldError } from "@/components/forms/FieldError";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  EXAM_TYPE_OPTIONS,
  STUDY_PHASE_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/constants";
import {
  PRESSURE_SOURCES,
  type ExamType,
  type PressureSource,
  type PreferredTone,
  type StudyPhase,
} from "@/lib/types";
import { onboardingSchema } from "@/lib/validation/onboarding-schema";
import { fieldErrors } from "@/lib/validation/errors";
import { getStorage } from "@/lib/storage";
import { useHydrated } from "@/lib/hooks/useHydrated";

export function OnboardingForm() {
  const router = useRouter();
  const hydrated = useHydrated();

  const [examType, setExamType] = useState<ExamType | null>(null);
  const [targetExamDate, setTargetExamDate] = useState("");
  const [studyPhase, setStudyPhase] = useState<StudyPhase | null>(null);
  const [pressureSources, setPressureSources] = useState<PressureSource[]>([]);
  const [preferredTone, setPreferredTone] = useState<PreferredTone | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill from an existing profile (edit mode) once on the client.
  useEffect(() => {
    const profile = getStorage().getProfile();
    if (!profile) return;
    setExamType(profile.examType);
    setTargetExamDate(profile.targetExamDate ?? "");
    setStudyPhase(profile.studyPhase);
    setPressureSources(profile.pressureSources);
    setPreferredTone(profile.preferredTone);
  }, []);

  function togglePressure(source: PressureSource) {
    setPressureSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source],
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = onboardingSchema.safeParse({
      examType,
      targetExamDate,
      studyPhase,
      pressureSources,
      preferredTone,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    getStorage().saveProfile(parsed.data);
    router.push("/check-in");
  }

  if (!hydrated) {
    return <Card aria-busy="true">Loading your profile…</Card>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Card>
        <OptionGroup
          name="examType"
          legend="Which exam are you preparing for?"
          options={EXAM_TYPE_OPTIONS}
          value={examType}
          onChange={setExamType}
          error={errors.examType}
          variant="pills"
        />
      </Card>

      <Card>
        <label htmlFor="targetExamDate" className="font-medium text-ink">
          When is your exam? <span className="text-ink-faint">(optional)</span>
        </label>
        <p className="mt-0.5 text-sm text-ink-soft">
          A month or date is fine, e.g. &ldquo;May 2027&rdquo;.
        </p>
        <input
          id="targetExamDate"
          type="text"
          inputMode="text"
          value={targetExamDate}
          onChange={(e) => setTargetExamDate(e.target.value)}
          aria-invalid={errors.targetExamDate ? true : undefined}
          aria-describedby={
            errors.targetExamDate ? "targetExamDate-error" : undefined
          }
          placeholder="May 2027"
          className="mt-2 w-full rounded-xl border border-line bg-surface p-3 text-ink placeholder:text-ink-faint"
        />
        <FieldError id="targetExamDate-error" message={errors.targetExamDate} />
      </Card>

      <Card>
        <OptionGroup
          name="studyPhase"
          legend="Where are you in your prep?"
          options={STUDY_PHASE_OPTIONS}
          value={studyPhase}
          onChange={setStudyPhase}
          error={errors.studyPhase}
        />
      </Card>

      <Card>
        <ChipMultiSelect
          name="pressureSources"
          legend="What's adding pressure right now?"
          hint="Choose any that apply — or none."
          options={PRESSURE_SOURCES}
          selected={pressureSources}
          onToggle={togglePressure}
        />
      </Card>

      <Card>
        <OptionGroup
          name="preferredTone"
          legend="How would you like MindMate to talk with you?"
          options={TONE_OPTIONS}
          value={preferredTone}
          onChange={setPreferredTone}
          error={errors.preferredTone}
        />
      </Card>

      <Button type="submit" className="w-full">
        Save and start check-in
      </Button>
    </form>
  );
}
