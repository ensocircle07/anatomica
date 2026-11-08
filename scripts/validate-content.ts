// `npm run validate` — checks every content record (ARCHITECTURE §2, ADR-0011).
// If any problem is found the process exits with code 1, which stops the deployment.

import { entities, references, regions, systems } from "../src/content/index.ts";
import { formatIssue, validateContent } from "../src/core/validate/validate.ts";

const issues = validateContent({
  entities,
  references,
  regionIds: regions.map((r) => r.id),
  systemIds: systems.map((s) => s.id),
});

const stubs = entities.filter((e) => "stub" in e).length;

if (issues.length > 0) {
  console.error(`Content validation FAILED with ${issues.length} problem(s):`);
  for (const issue of issues) console.error("  - " + formatIssue(issue));
  process.exit(1);
}
console.log(
  `Content validation passed: ${entities.length} records (${entities.length - stubs} full, ${stubs} stubs), ${references.length} references.`,
);
