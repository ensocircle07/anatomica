// Enforces ADR-0005: src/content and src/core must stay independent of the web UI,
// so they can be reused by search, quizzes and a future Android app.
//
// tsconfig.core.json already makes browser APIs (window, document) a type error there.
// This script additionally blocks imports of UI libraries and of UI folders.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const protectedDirs = ["src/content", "src/core"];

const forbiddenPackages = ["react", "react-dom", "react-router", "lucide-react"];
const forbiddenFolders = ["app", "features", "components", "styles"];

const importPattern = /(?:import|export)\s[^"']*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

const problems: string[] = [];

for (const dir of protectedDirs) {
  for (const file of listFiles(join(root, dir))) {
    const rel = relative(root, file).replaceAll("\\", "/");
    if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
      problems.push(`${rel}: JSX files are not allowed here`);
      continue;
    }
    if (!file.endsWith(".ts")) continue;

    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const spec = match[1] ?? match[2] ?? "";
      const isForbiddenPackage = forbiddenPackages.some((pkg) => spec === pkg || spec.startsWith(pkg + "/"));
      const isForbiddenFolder = spec.startsWith(".") && forbiddenFolders.some((f) => spec.split("/").includes(f));
      if (isForbiddenPackage || isForbiddenFolder) {
        problems.push(`${rel}: must not import "${spec}"`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error("Boundary check FAILED (see docs/decisions/0005-knowledge-graph-and-stack.md):");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`Boundary check passed: ${protectedDirs.join(" and ")} are free of UI imports.`);
