"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoodSelector } from "@/components/forms/MoodSelector";
import { LevelSlider } from "@/components/forms/LevelSlider";
import { JournalInput } from "@/components/forms/JournalInput";
import { OptionGroup } from "@/components/forms/OptionGroup";
import { ChipMultiSelect } from "@/components/forms/ChipMultiSelect";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SLEEP_OPTIONS } from "@/lib/constants";
import {
  CHECKIN_TAGS,
  type CheckInTag,
  type Mood,
  type SleepQuality,
} from "@/lib/types";
import { checkInSchema } from "@/lib/validation/checkin-schema";
import { fieldErrors } from "@/lib/validation/errors";
import { getStorage } from "@/lib/storage";

/**
 * Daily check-in form. Validates with the shared Zod schema, persists via the
 * storage service, then hands off to the reflection screen which runs the
 * analysis. Persisting first means the reflection can be re-derived/cached
 * against a real check-in id (efficiency).
 */
export function CheckInForm() {
  const router = useRouter();

  const [mood, setMood] = useState<Mood | null>(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [studyPressure, setStudyPressure] = useState(5);
  const [journalText, setJournalText] = useState("");
  const [tags, setTags] = useState<CheckInTag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleTag(tag: CheckInTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = checkInSchema.safeParse({
      mood,
      stressLevel,
      energyLevel,
      sleepQuality,
      studyPressure,
      journalText,
      tags,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    const checkIn = getStorage().addCheckIn(parsed.data);
    router.push(`/reflection?c=${checkIn.id}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Card>
        <MoodSelector value={mood} onChange={setMood} error={errors.mood} />
      </Card>

      <Card className="space-y-6">
        <LevelSlider
          id="stressLevel"
          label="Stress level"
          value={stressLevel}
          onChange={setStressLevel}
          lowLabel="Calm"
          highLabel="Overwhelmed"
        />
        <LevelSlider
          id="energyLevel"
          label="Energy level"
          value={energyLevel}
          onChange={setEnergyLevel}
          lowLabel="Drained"
          highLabel="Energised"
        />
        <LevelSlider
          id="studyPressure"
          label="Study pressure"
          value={studyPressure}
          onChange={setStudyPressure}
          lowLabel="Light"
          highLabel="Intense"
        />
      </Card>

      <Card>
        <OptionGroup
          name="sleepQuality"
          legend="How did you sleep?"
          options={SLEEP_OPTIONS}
          value={sleepQuality}
          onChange={setSleepQuality}
          error={errors.sleepQuality}
          variant="pills"
        />
      </Card>

      <Card>
        <JournalInput
          id="journalText"
          value={journalText}
          onChange={setJournalText}
          error={errors.journalText}
        />
      </Card>

      <Card>
        <ChipMultiSelect
          name="tags"
          legend="Anything in particular today?"
          hint="Optional tags to add context."
          options={CHECKIN_TAGS}
          selected={tags}
          onToggle={toggleTag}
        />
      </Card>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Analysing…" : "Analyze my check-in"}
      </Button>
    </form>
  );
}
