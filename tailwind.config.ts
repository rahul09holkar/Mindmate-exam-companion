import type { Config } from "tailwindcss";

/**
 * Calm, neutral, accessible palette.
 * Colors are chosen for WCAG AA contrast on the light surface tones.
 * No color carries meaning alone — pair with text/icons in the UI.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft neutral background system
        canvas: "#f6f7f9", // app background
        surface: "#ffffff", // cards
        ink: {
          DEFAULT: "#1f2933", // primary text (AA on canvas/surface)
          soft: "#52606d", // secondary text
          faint: "#7b8794", // tertiary / hints
        },
        line: "#e4e7eb", // borders / dividers
        // Calm sage/teal primary — credible, not clinical
        brand: {
          DEFAULT: "#3f7e74",
          dark: "#2f5f57",
          soft: "#e6f0ee",
        },
        // Semantic accents (always paired with labels/icons in UI)
        calm: "#5b8def",
        warn: "#c77d2e",
        alert: "#b3433a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      maxWidth: {
        app: "480px", // mobile-first content column
      },
    },
  },
  plugins: [],
};

export default config;
