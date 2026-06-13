/**
 * Static, offline support exercises. These never call the AI — they are always
 * available, even with no network or no key. Each is short, concrete, and
 * written in MindMate's gentle, non-diagnostic tone.
 */
export type SupportExercise = {
  id: string;
  title: string;
  icon: string;
  /** One-line description of when this helps. */
  summary: string;
  /** Estimated time to complete. */
  duration: string;
  /** Ordered steps the student can follow. */
  steps: string[];
};

export const SUPPORT_EXERCISES: SupportExercise[] = [
  {
    id: "breathing",
    title: "Box breathing",
    icon: "🫁",
    summary: "Steady your breath to calm a racing mind.",
    duration: "2 min",
    steps: [
      "Sit comfortably and let your shoulders drop.",
      "Breathe in through your nose for a count of 4.",
      "Hold gently for a count of 4.",
      "Breathe out slowly for a count of 4, then hold for 4.",
      "Repeat the square for about two minutes.",
    ],
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 grounding",
    icon: "🌳",
    summary: "Come back to the present when thoughts spiral.",
    duration: "2 min",
    steps: [
      "Name 5 things you can see right now.",
      "Notice 4 things you can feel (your feet, the chair).",
      "Listen for 3 things you can hear.",
      "Find 2 things you can smell.",
      "Notice 1 thing you can taste, and take a slow breath.",
    ],
  },
  {
    id: "panic-reset",
    title: "Exam panic reset",
    icon: "🧊",
    summary: "For the wave of panic before or during prep.",
    duration: "3 min",
    steps: [
      "Pause. Remind yourself: this feeling is uncomfortable, not dangerous.",
      "Drop your shoulders and unclench your jaw.",
      "Breathe out longer than you breathe in, five times.",
      "Place both feet flat and feel the ground holding you.",
      "Name one small, doable next action — just the very next step.",
    ],
  },
  {
    id: "sleep-wind-down",
    title: "Sleep wind-down",
    icon: "🌙",
    summary: "Help your mind settle when sleep feels far away.",
    duration: "5 min",
    steps: [
      "Dim the lights and put screens away.",
      "Breathe in for 4 and out for 6, slowly, for a minute.",
      "Gently relax each part of your body, from your feet upward.",
      "Let your mind rest on one small thing that went okay today.",
      "If thoughts about tomorrow arrive, set them aside — they'll keep.",
    ],
  },
  {
    id: "study-guilt-reset",
    title: "Study guilt reset",
    icon: "🍃",
    summary: "For the guilt of resting or 'not doing enough'.",
    duration: "2 min",
    steps: [
      "Notice the guilt without arguing with it.",
      "Remind yourself: rest is part of studying, not the opposite of it.",
      "Recall one thing you did do today, however small.",
      "Decide on one gentle next step — and a real break after it.",
      "Let 'enough for now' be genuinely enough.",
    ],
  },
];
