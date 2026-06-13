# MindMate Exam Companion

A calm, private, mobile-first GenAI wellness companion for students preparing for high-stakes exams (NEET, JEE, CUET, CAT, GATE, UPSC, boards).

## Chosen vertical

**Mental-wellness / journaling assistant for high-stakes exam-prep students.**

The persona is the exam aspirant (NEET, JEE, CUET, CAT, GATE, UPSC, boards) under sustained academic pressure. The assistant makes **logical, context-aware decisions** from each user's exam type, study phase, preferred tone, and recent reflections — and always lets a crisis signal override everything else. Its differentiating value is surfacing *hidden* emotional patterns a numeric mood tracker cannot.

## Problem statement

Students preparing for high-stakes exams face severe stress, burnout, and self-doubt. Standard mood trackers capture numbers but miss the *story*. MindMate analyses open-ended daily journaling + mood logs to uncover **hidden stress triggers and emotional patterns standard trackers miss**, and offers hyper-personalised, contextual support — coping strategies, adaptive mindfulness, and an empathetic always-available companion. It is **not** a diagnosis tool or a therapist replacement.

## Solution overview

- **Daily check-in** is the core object: mood, stress, energy, sleep, study pressure, journal, tags.
- **Journal analysis** (the core AI value) surfaces an emotional summary, detected triggers, a *hidden pattern hypothesis*, a coping step, a 2-minute mindfulness exercise, a motivational reframe, and a risk level.
- **Weekly dashboard** shows mood/stress trends, common triggers, what you can lean on, a generated summary, and a recommended next habit — with **zero extra AI calls** (it reuses stored reflections).
- **Support toolkit**: five offline exercises (breathing, grounding, exam panic reset, sleep wind-down, study guilt reset).
- **Companion chat**: contextual, empathetic, uses your profile + recent reflections.
- **Safety**: a deterministic classifier routes self-harm / crisis content to a calm `/safety` screen — no AI advice, no diagnosis, no false claims of contacting help.

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · Zod · Recharts · Vitest + React Testing Library · OpenAI (server-side) with a deterministic mock fallback.

## Setup

```bash
npm install
cp .env.example .env.local   # then add your key (optional)
npm run dev                  # http://localhost:3000
```

## Environment variables

All AI config is **server-side only** — never prefixed `NEXT_PUBLIC_`.

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Enables real LLM analysis. Leave empty for mock mode. |
| `OPENAI_MODEL` | Optional model override (default `gpt-4o-mini`). |

## AI / mock mode

- **No key set → mock mode.** A deterministic, offline analyzer + companion produce structured, keyword-aware responses, so the full app works with no key and no network.
- **Key set → OpenAI.** The server calls the OpenAI Chat Completions API (JSON mode for reflections). All output is validated with Zod; any provider error or invalid response degrades gracefully to the mock.
- The AI flow is `UI → validation → safety classifier → analyzer → structured reflection → persistence → UI`. LLMs are **never** called from React components.

## Security notes

- API keys are read server-side only and never exposed to the client.
- All user input is validated with Zod at every server boundary; no client-provided IDs/roles are trusted.
- Raw journal text and chat contents are **never logged**; errors return generic messages, never stack traces.
- User content is rendered as escaped text (no `dangerouslySetInnerHTML`) and run through a sanitiser.
- Data is stored locally on-device; the privacy screen offers export and full delete.

## Testing

```bash
npm run test       # Vitest
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

Coverage focuses on the highest-value areas: safety classifier (crisis vs ordinary stress), mock analyzer (trigger detection + crisis short-circuit), validation schemas, analytics, chat companion (crisis routing), and UI smoke tests.

## Assumptions

- **No auth and no server database for the MVP.** Data persists on-device (browser storage) behind a single, swappable persistence service, so it can later move to a real backend (e.g. Supabase) without touching the UI.
- **Not a therapist or diagnosis tool.** The crisis flow routes to human support and never claims to have contacted emergency services; the AI never diagnoses.
- **Mock mode is the default path.** With no `OPENAI_API_KEY`, a deterministic offline analyzer + companion produce structured responses, so the full app runs with no key and no network — the app is always usable for an evaluator.
- **English-language journals**, and **one user per device/browser** (no multi-account separation in the MVP).
- Real LLM output is treated as untrusted: it is parsed in JSON mode, re-validated with Zod, and any failure degrades gracefully to the mock.

## Hackathon demo flow

1. **Onboarding** → JEE, Final Sprint, pressure = Parents/Mock Scores, tone = Gentle.
2. **Check-in** → paste the demo journal below, stress 9, sleep poor → **Analyze my check-in**.
3. **Reflection** → triggers (mock test, rank, family, sleep) + the hidden pattern *"self-worth tied to performance."*
4. **Dashboard** → trends, common triggers, weekly summary, next habit. (Empty? Use **Explore with sample data**.)
5. **Support** → run a 2-minute breathing exercise (offline).
6. **Chat** → "I panicked after a mock test" → contextual empathetic reply.
7. **Safety** → type a crisis phrase in chat or check-in → routed calmly to `/safety`.
8. **Privacy** → export or delete your data.

### Demo journal

> "I scored badly in my mock test and now I feel like I'm falling behind. My parents keep asking about my rank and I can't sleep properly."

**Expected insight:** triggers = mock test score, parental pressure, sleep disruption · pattern = self-worth linked to performance · coping = 2-minute grounding + next small study step · reframe = one mock test is feedback, not identity.
