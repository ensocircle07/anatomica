// Runs after `vite build` (see the "build" script in package.json).
//
// GitHub Pages only serves files that exist. Without this script, opening
// https://ensocircle07.github.io/anatomica/about/build directly (or pressing
// refresh there) would return "404 Not Found", because only dist/index.html exists.
//
// This script writes a real index.html for every route, each with its own
// <title> and description (ADR-0006), plus a 404.html for unknown addresses.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { staticRoutes } from "../src/core/routes.ts";
import { renderShell, shellFilePath } from "./route-shells.ts";

const distDir = join(import.meta.dirname, "..", "dist");
const template = readFileSync(join(distDir, "index.html"), "utf8");

for (const route of staticRoutes) {
  const outFile = join(distDir, shellFilePath(route.path));
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, renderShell(template, route));
}

// Unknown addresses: GitHub Pages serves 404.html with a real 404 status.
// The app still loads and shows its own "Page not found" page.
writeFileSync(
  join(distDir, "404.html"),
  renderShell(template, {
    title: "Page not found — ANATOMICA",
    description: "This page does not exist in ANATOMICA.",
  }),
);

console.log(`Route shells: wrote ${staticRoutes.length} route pages and 404.html`);
