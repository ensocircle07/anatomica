import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Build information shown on /about/build, used to confirm which version is live.
// GITHUB_SHA is set automatically inside GitHub Actions.
const commit = process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
const builtAt = new Date().toISOString();

// The site is served from https://ensocircle07.github.io/anatomica/ (ADR-0007),
// so every asset URL must be prefixed with /anatomica/.
export default defineConfig({
  base: "/anatomica/",
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit),
    __BUILD_TIME__: JSON.stringify(builtAt),
  },
  test: {
    include: ["tests/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
