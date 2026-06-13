/**
 * UI-facing option metadata: human labels (and, for mood, an icon) for each
 * enum value. Kept separate from {@link module:lib/types} so the domain stays
 * label-free while the UI has accessible, non-color-only descriptions.
 */
import type {
  ExamType,
  Mood,
  PreferredTone,
  SleepQuality,
  StudyPhase,
} from "@/lib/types";

export type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export const EXAM_TYPE_OPTIONS: Option<ExamType>[] = [
  { value: "NEET", label: "NEET" },
  { value: "JEE", label: "JEE" },
  { value: "CUET", label: "CUET" },
  { value: "CAT", label: "CAT" },
  { value: "GATE", label: "GATE" },
  { value: "UPSC", label: "UPSC" },
  { value: "BOARD", label: "Board exams" },
  { value: "OTHER", label: "Something else" },
];

export const STUDY_PHASE_OPTIONS: Option<StudyPhase>[] = [
  { value: "STARTING", label: "Just starting", description: "Building the base" },
  { value: "REVISION", label: "Revision", description: "Going back over topics" },
  { value: "MOCK_TESTS", label: "Mock tests", description: "Practising under pressure" },
  { value: "FINAL_SPRINT", label: "Final sprint", description: "The last stretch" },
];

export const TONE_OPTIONS: Option<PreferredTone>[] = [
  { value: "GENTLE", label: "Gentle", description: "Soft and reassuring" },
  { value: "DIRECT", label: "Direct", description: "Clear and to the point" },
  { value: "MOTIVATIONAL", label: "Motivational", description: "Encouraging and energising" },
  { value: "PRACTICAL", label: "Practical", description: "Focused on next steps" },
];

export const SLEEP_OPTIONS: Option<SleepQuality>[] = [
  { value: "POOR", label: "Poor" },
  { value: "AVERAGE", label: "Average" },
  { value: "GOOD", label: "Good" },
];

/** Mood options carry an icon so meaning never relies on colour alone. */
export const MOOD_OPTIONS: Array<Option<Mood> & { icon: string }> = [
  { value: "VERY_LOW", label: "Very low", icon: "😔" },
  { value: "LOW", label: "Low", icon: "🙁" },
  { value: "OKAY", label: "Okay", icon: "😐" },
  { value: "GOOD", label: "Good", icon: "🙂" },
  { value: "GREAT", label: "Great", icon: "😄" },
];
