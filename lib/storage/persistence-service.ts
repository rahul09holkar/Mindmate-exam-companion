import type {
  AIReflection,
  CheckIn,
  CheckInInput,
  ExportBundle,
  OnboardingInput,
  ReflectionContent,
  StudentProfile,
} from "@/lib/types";
import { createId, nowIso } from "@/lib/utils/id";
import type { KeyValueStore } from "./kv-store";

export const SCHEMA_VERSION = 1;

const KEYS = {
  profile: `mindmate.v${SCHEMA_VERSION}.profile`,
  checkIns: `mindmate.v${SCHEMA_VERSION}.checkins`,
  reflections: `mindmate.v${SCHEMA_VERSION}.reflections`,
} as const;

/** Parse stored JSON safely; corrupted values fall back instead of throwing. */
function readJson<T>(store: KeyValueStore, key: string, fallback: T): T {
  const raw = store.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(store: KeyValueStore, key: string, value: unknown): void {
  store.setItem(key, JSON.stringify(value));
}

/**
 * The single, typed persistence boundary for the app. Components and hooks go
 * through this service rather than touching storage directly. It assigns all
 * identity and timestamp fields itself so they are never trusted from input.
 */
export class PersistenceService {
  constructor(private readonly store: KeyValueStore) {}

  // --- Profile -------------------------------------------------------------

  getProfile(): StudentProfile | null {
    return readJson<StudentProfile | null>(this.store, KEYS.profile, null);
  }

  /** Create the profile, or update the existing one (preserving id/createdAt). */
  saveProfile(input: OnboardingInput): StudentProfile {
    const existing = this.getProfile();
    const now = nowIso();
    const profile: StudentProfile = {
      id: existing?.id ?? createId(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...input,
    };
    writeJson(this.store, KEYS.profile, profile);
    return profile;
  }

  // --- Check-ins -----------------------------------------------------------

  listCheckIns(): CheckIn[] {
    return readJson<CheckIn[]>(this.store, KEYS.checkIns, []);
  }

  getCheckIn(id: string): CheckIn | null {
    return this.listCheckIns().find((c) => c.id === id) ?? null;
  }

  addCheckIn(input: CheckInInput): CheckIn {
    const checkIn: CheckIn = { id: createId(), createdAt: nowIso(), ...input };
    const all = this.listCheckIns();
    // Newest first keeps the common dashboard/most-recent reads cheap.
    writeJson(this.store, KEYS.checkIns, [checkIn, ...all]);
    return checkIn;
  }

  // --- Reflections ---------------------------------------------------------

  listReflections(): AIReflection[] {
    return readJson<AIReflection[]>(this.store, KEYS.reflections, []);
  }

  /** Look up a stored reflection by its check-in, enabling reuse (efficiency). */
  getReflectionByCheckIn(checkinId: string): AIReflection | null {
    return (
      this.listReflections().find((r) => r.checkinId === checkinId) ?? null
    );
  }

  /** Persist an AI/mock reflection for a check-in (idempotent per check-in). */
  saveReflection(
    checkinId: string,
    content: ReflectionContent,
  ): AIReflection {
    const reflection: AIReflection = {
      id: createId(),
      checkinId,
      createdAt: nowIso(),
      ...content,
    };
    const others = this.listReflections().filter(
      (r) => r.checkinId !== checkinId,
    );
    writeJson(this.store, KEYS.reflections, [reflection, ...others]);
    return reflection;
  }

  // --- Privacy controls ----------------------------------------------------

  exportAll(): ExportBundle {
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: nowIso(),
      profile: this.getProfile(),
      checkIns: this.listCheckIns(),
      reflections: this.listReflections(),
    };
  }

  /**
   * Replace stored data wholesale. Symmetric with {@link exportAll} and used
   * for demo seeding and tests. Only the provided slices are overwritten.
   */
  importAll(bundle: Partial<ExportBundle>): void {
    if (bundle.profile !== undefined) {
      if (bundle.profile === null) this.store.removeItem(KEYS.profile);
      else writeJson(this.store, KEYS.profile, bundle.profile);
    }
    if (bundle.checkIns !== undefined) {
      writeJson(this.store, KEYS.checkIns, bundle.checkIns);
    }
    if (bundle.reflections !== undefined) {
      writeJson(this.store, KEYS.reflections, bundle.reflections);
    }
  }

  /** Delete everything MindMate has stored on this device. */
  clearAll(): void {
    this.store.removeItem(KEYS.profile);
    this.store.removeItem(KEYS.checkIns);
    this.store.removeItem(KEYS.reflections);
  }
}
