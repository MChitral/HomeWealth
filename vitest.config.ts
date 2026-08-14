import { defineConfig } from "vitest/config";
// @vitejs/plugin-react-swc supports vite 4-8 and works with vitest 4.x
import react from "vitest-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["client/src/**/__tests__/**/*.test.{ts,tsx}", "client/src/**/*.test.{ts,tsx}"],
    // Exclude test files that use node:test (run separately via tsx --test)
    exclude: [
      "**/node_modules/**",
      "client/src/features/mortgage-tracking/utils/__tests__/mortgage-math.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
});
