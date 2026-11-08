// `npm run coverage`         — writes docs/CONTENT_STATUS.md
// `npm run coverage -- --check` — fails if docs/CONTENT_STATUS.md is out of date (used by `npm run verify`)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { entities, references } from "../src/content/index.ts";
import { manifests } from "../src/content/manifests/upper-limb-seed.ts";
import { buildCoverageReport } from "../src/core/coverage/report.ts";

const target = join(import.meta.dirname, "..", "docs", "CONTENT_STATUS.md");
const report = buildCoverageReport({ entities, references, manifests });

if (process.argv.includes("--check")) {
  const current = existsSync(target) ? readFileSync(target, "utf8").replaceAll("\r\n", "\n") : "";
  if (current !== report) {
    console.error("docs/CONTENT_STATUS.md is out of date. Run `npm run coverage` and commit the result.");
    process.exit(1);
  }
  console.log("Coverage report is up to date.");
} else {
  writeFileSync(target, report, "utf8");
  console.log("Wrote docs/CONTENT_STATUS.md");
}
