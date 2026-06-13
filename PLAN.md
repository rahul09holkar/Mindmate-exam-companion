# MindMate Exam Companion — End-to-End Implementation Plan

> **Status:** Planning · **Owner:** Product Architecture · **Last updated:** 2026-06-13
> **Type:** Hackathon MVP — GenAI mental wellness tracker for high-stakes exam students

---

## 1. Problem Statement (Restated)

Students preparing for NEET, JEE, CUET, CAT, GATE, UPSC, and boards face severe stress, burnout, and self-doubt. Standard mood trackers capture *numbers* but miss the *story*. We need a GenAI companion that:

- analyzes **open-ended daily journals + mood logs**,
- uncovers **hidden stress triggers and emotional patterns standard trackers miss**,
- delivers **hyper-personalized, contextual** coping strategies, adaptive mindfulness, and motivational encouragement,
- acts as a **safe, empathetic, always-available** digital companion — *not* a therapist or diagnosis tool.

**Core product object:** the *daily check-in*.
**Core AI value:** *journal analysis that surfaces patterns a numeric tracker cannot.*
**Engagement thesis:** emotional resonance ("it saw something I didn't"), **not** gamified streaks — streak pressure is harmful for already-stressed students.

---

## 2. Scoring Criteria → Engineering Strategy

The first two criteria carry the highest weight. Every decision below is justified against this table.

| # | Criterion | Weight | How we win it |
|---|-----------|--------|---------------|
| 1 | **Code quality** | High | Layered architecture, no AI calls in components, single persistence service, typed end-to-end, Zod at every boundary, reusable component library, small composable modules. |
| 2 | **Problem alignment** | High | Check-in is the hero object; journal *pattern detection* is foregrounded (not just a chatbot); exam-context personalization; safety escalation; weekly patterns. |
| 3 | **Security** | Med-High | Server-only AI keys, `.env.example`, Zod validation, sanitized rendering, no raw journal logging, safe error handling, no client-trusted IDs. |
| 4 | **Testing** | Med | Vitest unit tests for safety classifier, mock analyzer, validation; RTL smoke tests for key screens. |
| 5 | **Efficiency** | Med | Reflections cached after generation & reused on dashboard; mock mode avoids API calls; lightweight pages; loading states; no over-fetch. |
| 6 | **Accessibility** | Med | Labeled inputs, keyboard-accessible controls, contrast, **labels not color-only** for emotion, visible focus, no flashing. |

---

## 3. Tech Stack (Decision)

Starting from scratch → adopt the recommended stack:

- **Next.js (App Router) + TypeScript** — server actions/route handlers keep AI server-side.
- **Tailwind CSS** + **shadcn/ui** — calm, accessible, card-based UI fast.
- **Zod** — validation at all trust boundaries.
- **Recharts** — dashboard trend charts.
- **AI wrapper** — server-side `ai-client.ts` calling the **OpenAI Chat Completions API** (JSON mode); defaults to a **deterministic mock analyzer** when no key is set, and degrades to it on any provider error.
- **Persistence** — local storage **behind a single `storage` service** (no scattered `localStorage`). Swappable for Supabase later.
- **Testing** — Vitest + React Testing Library. Playwright only if time permits.

**Non-goals:** no DB infra, no auth provider, no real backend persistence for MVP (clearly isolated so it's swappable).

---

## 4. Architecture

### 4.1 AI request flow (mandated)
```
UI (client component)
  → server action / route handler
    → Zod validation        (lib/validation)
    → safety classifier      (lib/ai/safety-classifier)   ── CRISIS? short-circuit → /safety
    → journal analyzer       (lib/ai/journal-analyzer)
        → ai-client          (lib/ai/ai-client)  ── real provider OR deterministic mock
        → prompt-templates   (lib/ai/prompt-templates)
    → structured reflection  (validated AIReflection)
    → persistence            (lib/storage)
  → rendered reflection UI
```

### 4.2 Directory layout
```
app/
  layout.tsx                      # AppShell, fonts, theme
  page.tsx                        # / landing
  onboarding/page.tsx
  check-in/page.tsx
  reflection/page.tsx
  dashboard/page.tsx
  support/page.tsx
  chat/page.tsx
  safety/page.tsx
  privacy/page.tsx
  api/
    analyze/route.ts              # POST check-in → reflection (server-side AI)
    chat/route.ts                 # POST chat message → empathetic reply + safety
components/
  AppShell.tsx  PageHeader.tsx
  MoodSelector.tsx  LevelSlider.tsx  JournalInput.tsx  CheckInForm.tsx
  ReflectionCard.tsx  TriggerChips.tsx  CopingCard.tsx  MindfulnessExerciseCard.tsx
  WeeklyTrendChart.tsx  SupportToolCard.tsx  ChatPanel.tsx
  SafetyNotice.tsx  PrivacyControls.tsx
  ui/                             # shadcn primitives
lib/
  types.ts                        # ExamType, CheckIn, AIReflection, etc.
  ai/
    ai-client.ts                  # provider abstraction + mock
    safety-classifier.ts
    journal-analyzer.ts
    prompt-templates.ts
  validation/
    checkin-schema.ts
    onboarding-schema.ts
  storage/
    index.ts                      # PersistenceService interface
    local-storage.ts              # browser impl
    seed.ts                       # demo seed data
  utils/
    sanitize.ts
    analytics.ts                  # weekly aggregation (mood/stress trends, triggers)
__tests__/
  safety-classifier.test.ts
  journal-analyzer.test.ts
  checkin-schema.test.ts
  components/*.test.tsx
.env.example
README.md
```

### 4.3 Data model
Implements the contract types verbatim: `StudentProfile`, `CheckIn`, `AIReflection`, plus enums `ExamType`, `StudyPhase`, `PreferredTone`, `RiskLevel`. All persisted via the storage service keyed by a locally-generated profile id (never trusted from client input on a server boundary).

---

## 5. Safety Design (product-critical)

**Classifier** (`safety-classifier.ts`): rule-based phrase matching for suicide / self-harm / ending life / not wanting to live / harming oneself / immediate danger → `riskLevel = CRISIS`.

**On CRISIS:**
- short-circuit *before* the analyzer — no normal motivational advice, no diagnosis,
- route to `/safety`,
- show calm message: "You deserve immediate human support… contact a trusted person or emergency support now,"
- **never** claim emergency services were contacted,
- keep `/safety` free of long AI output.

Tone enforced everywhere: "It sounds like…", "You may be feeling…", "One small step could be…", "This is not a diagnosis…". Banned: "You are depressed", "You must", "Don't worry", "Everything will be fine".

---

## 6. Mock Analyzer (demo guarantee)

Deterministic keyword detection so the demo works with **zero API key**, still feeling intelligent. Detects: `mock test`, `parents`, `rank`, `sleep`, `backlog`, `failure`, `comparison`, `panic`, `can't focus`, `tired`, `hopeless` → maps to triggers, a pattern hypothesis, coping strategy, mindfulness, and reframe. Crisis keywords always override to CRISIS.

**Demo journal:** *"I scored badly in my mock test and now I feel like I'm falling behind. My parents keep asking about my rank and I can't sleep properly."*
→ triggers: mock-test score, parental pressure, sleep disruption · pattern: self-worth linked to performance · coping: 2-min grounding + next small step · reframe: one mock test is feedback, not identity.

---

## 7. Build Passes (incremental, each independently demoable)

| Pass | Scope | Exit criteria |
|------|-------|---------------|
| **1** | App shell, layout, nav, all 9 routes as placeholders | App runs, every route navigable, mobile-first shell |
| **2** | Types, Zod schemas, storage service + seed | Types compile, schemas tested, storage CRUD works |
| **3** | Onboarding + check-in forms with validation | Profile saved; check-in validated & persisted |
| **4** | Safety classifier, mock analyzer, optional real client, reflection UI | Check-in → reflection; crisis → /safety |
| **5** | Dashboard (trends, triggers, weekly summary) + support toolkit | Charts render from stored check-ins; support tools work offline |
| **6** | Contextual chat with suggested prompts + safety guardrails | Chat uses profile + recent reflections; crisis handled |
| **7** | Tests, `.env.example`, README, error/loading states, a11y pass | Tests green, README complete, a11y checklist met |

---

## 8. Test Plan (minimum, score-relevant)

- **Safety classifier:** normal stress → LOW/MODERATE; self-harm text → CRISIS.
- **Journal mock:** detects mock-test stress; parental pressure; sleep issue.
- **Validation:** rejects invalid stress level; rejects invalid mood; accepts valid check-in.
- **UI smoke:** check-in form renders; support toolkit renders; safety screen renders.

---

## 9. Accessibility Checklist

- [ ] Every input has a visible `<label>`
- [ ] All controls keyboard-operable, visible focus rings
- [ ] Emotion shown via **text label + icon**, never color alone
- [ ] WCAG AA contrast on soft neutral palette
- [ ] No flashing/auto-playing animation
- [ ] Readable type scale on mobile (base ≥ 16px)
- [ ] One primary action per screen

---

## 10. Security Checklist

- [ ] No hard-coded keys; all via env; AI key **server-only**
- [ ] `.env.example` committed
- [ ] Zod validation on every server boundary
- [ ] No client-trusted user/role/tenant IDs
- [ ] Raw journal text never written to logs
- [ ] User content sanitized before render
- [ ] AI errors handled gracefully; no stack traces to users

---

## 11. Acceptance Criteria (definition of done)

Student can: create exam profile · submit mood+journal check-in · receive personalized reflection · see identified triggers · view weekly pattern dashboard · use coping/mindfulness support · chat with AI companion · be routed to safety on crisis content. App demonstrates clear security, meaningful tests, mobile-friendly + accessible UI.

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Judges read "engaging" as gamified | Lead with emotional-resonance hook in README/demo; document why no streaks. |
| No API key at demo time | Deterministic mock analyzer is the default path. |
| Safety false-negatives | Conservative phrase list + crisis always overrides analyzer; manual demo of crisis path. |
| Scope creep beyond MVP | Strict pass-by-pass; storage/AI swappable but not over-built. |

---

## 13. Demo Script (90 seconds)

1. Onboarding → JEE, Final Sprint, pressure = Parents/Mock Scores, tone = Gentle.
2. Check-in → paste demo journal, stress 8, sleep poor → **Analyze**.
3. Reflection → show detected triggers + hidden pattern hypothesis (the "wow").
4. Dashboard → mood/stress trend + common triggers + weekly summary.
5. Support → run a 2-minute breathing exercise (works offline).
6. Chat → "I panicked after a mock test" → contextual empathetic reply.
7. Safety → submit crisis phrase → instant route to `/safety`, no AI essay.
8. Privacy → show delete-data control.
```
