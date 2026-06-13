/**
 * Domain types for MindMate.
 *
 * Enums are defined once as `as const` arrays and the union types are derived
 * from them, so the runtime option lists (used by forms and Zod) and the
 * compile-time types can never drift apart.
 */

// ---------------------------------------------------------------------------
// Enums (single source of truth)
// ---------------------------------------------------------------------------

export const EXAM_TYPES = [
  "NEET",
  "JEE",
  "CUET",
  "CAT",
  "GATE",
  "UPSC",
  "BOARD",
  "OTHER",
] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export const STUDY_PHASES = [
  "STARTING",
  "REVISION",
  "MOCK_TESTS",
  "FINAL_SPRINT",
] as const;
export type StudyPhase = (typeof STUDY_PHASES)[number];

export const PREFERRED_TONES = [
  "GENTLE",
  "DIRECT",
  "MOTIVATIONAL",
  "PRACTICAL",
] as const;
export type PreferredTone = (typeof PREFERRED_TONES)[number];

export const RISK_LEVELS = ["LOW", "MODERATE", "HIGH", "CRISIS"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const MOODS = ["VERY_LOW", "LOW", "OKAY", "GOOD", "GREAT"] as const;
export type Mood = (typeof MOODS)[number];

export const SLEEP_QUALITIES = ["POOR", "AVERAGE", "GOOD"] as const;
export type SleepQuality = (typeof SLEEP_QUALITIES)[number];

export const PRESSURE_SOURCES = [
  "Syllabus",
  "Parents",
  "Peers",
  "Mock Scores",
  "Sleep",
  "Focus",
  "Uncertainty",
] as const;
export type PressureSource = (typeof PRESSURE_SOURCES)[number];

export const CHECKIN_TAGS = [
  "Mock Test",
  "Family Pressure",
  "Backlog",
  "Comparison",
  "Exam Fear",
  "Focus Issue",
] as const;
export type CheckInTag = (typeof CHECKIN_TAGS)[number];

/** Slider fields are integers on a 1–10 scale. */
export const LEVEL_MIN = 1;
export const LEVEL_MAX = 10;

// ---------------------------------------------------------------------------
// Entities (persisted)
// ---------------------------------------------------------------------------

export type StudentProfile = {
  id: string;
  examType: ExamType;
  targetExamDate?: string;
  studyPhase: StudyPhase;
  pressureSources: PressureSource[];
  preferredTone: PreferredTone;
  createdAt: string;
  updatedAt: string;
};

export type CheckIn = {
  id: string;
  mood: Mood;
  stressLevel: number;
  energyLevel: number;
  sleepQuality: SleepQuality;
  studyPressure: number;
  journalText: string;
  tags: CheckInTag[];
  createdAt: string;
};

/**
 * The structured payload produced by the AI / mock analyzer. The persisted
 * {@link AIReflection} is this content plus service-assigned identity fields.
 */
export type ReflectionContent = {
  emotionalSummary: string;
  detectedTriggers: string[];
  patternHypothesis: string;
  copingStrategy: string;
  mindfulnessExercise: string;
  motivationalReframe: string;
  riskLevel: RiskLevel;
  safetyNotes?: string;
};

export type AIReflection = ReflectionContent & {
  id: string;
  checkinId: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Input shapes (user-supplied form payloads — validated by Zod)
// Identity/timestamp fields are intentionally absent: the service assigns them.
// ---------------------------------------------------------------------------

export type OnboardingInput = {
  examType: ExamType;
  targetExamDate?: string;
  studyPhase: StudyPhase;
  pressureSources: PressureSource[];
  preferredTone: PreferredTone;
};

export type CheckInInput = {
  mood: Mood;
  stressLevel: number;
  energyLevel: number;
  sleepQuality: SleepQuality;
  studyPressure: number;
  journalText: string;
  tags: CheckInTag[];
};

/** Portable snapshot of everything stored locally (privacy export). */
export type ExportBundle = {
  schemaVersion: number;
  exportedAt: string;
  profile: StudentProfile | null;
  checkIns: CheckIn[];
  reflections: AIReflection[];
};
