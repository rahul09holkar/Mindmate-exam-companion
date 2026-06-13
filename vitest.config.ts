import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the "@/*" path alias from tsconfig so tests import like the app.
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**", "app/**", "components/**"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts", "app/**/layout.tsx"],
    },
  },
});
