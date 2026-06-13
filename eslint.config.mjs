import next from "eslint-config-next/core-web-vitals";

const base = Array.isArray(next) ? next : [next];

/**
 * The new react-hooks "set-state-in-effect" rule flags the canonical
 * post-hydration pattern (reading client-only storage in an effect and setting
 * state). That pattern is intentional here to avoid SSR/client mismatches, so
 * the rule is relaxed to a warning rather than failing the build.
 */
const config = [
  ...base,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**"],
  },
];

export default config;
