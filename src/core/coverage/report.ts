// Coverage report (ARCHITECTURE §14). Produces the Markdown written to docs/CONTENT_STATUS.md.
// Deterministic (no timestamps), so the file only changes when content changes.
// Pure logic: no React, no DOM (ADR-0005).

import { isStub, type Entity, type FullEntity, type ReferenceRecord } from "../../content/schema/index.ts";
import type { Manifest } from "../../content/manifests/upper-limb-seed.ts";
import { isComplete } from "../status.ts";

/** Optional fields whose absence counts as "missing" (unless listed in meta.notApplicable). */
const OPTIONAL_FIELDS: Record<FullEntity["category"], string[]> = {
  bone: ["sideIdentification", "ossification", "radiology"],
  "bone-feature": ["palpability"],
  muscle: ["palpation"],
  nerve: ["fibres", "sensory"],
  artery: [],
  vein: ["valves"],
  space: ["surfaceLandmarks"],
  compartment: ["boundaries"],
  condition: ["signs", "examination", "investigations", "complications"],
};
const BASE_OPTIONAL = ["latinName", "taId"];

export function missingFields(e: FullEntity): string[] {
  const na = new Set(e.meta.notApplicable ?? []);
  const record = e as unknown as Record<string, unknown>;
  const missing = [...BASE_OPTIONAL, ...OPTIONAL_FIELDS[e.category]].filter((f) => {
    const v = record[f];
    return !na.has(f) && (v === undefined || (Array.isArray(v) && v.length === 0));
  });
  if (e.category === "muscle") {
    e.innervation.forEach((n, i) => { if (!n.roots) missing.push(`innervation[${i}].roots (${n.nerve})`); });
  }
  return missing;
}

export interface CoverageInput {
  entities: readonly Entity[];
  references: readonly ReferenceRecord[];
  manifests: readonly Manifest[];
}

export function buildCoverageReport({ entities, references, manifests }: CoverageInput): string {
  const byId = new Map(entities.map((e) => [e.id, e] as const));
  const full = entities.filter((e): e is FullEntity => !isStub(e)).sort((a, b) => a.id.localeCompare(b.id));
  const stubs = entities.filter(isStub).sort((a, b) => a.id.localeCompare(b.id));
  const lines: string[] = [];
  const out = (s = "") => lines.push(s);

  out("# Content status");
  out();
  out("> **Generated file — do not edit by hand.** Regenerate with `npm run coverage`.");
  out("> `npm run verify` fails if this file is out of date.");
  out();
  out(`Records: **${entities.length}** (${full.length} full, ${stubs.length} stubs). ` +
      `Complete (all four status dimensions final): **${full.filter((e) => isComplete(e.meta)).length}**.`);
  out();
  out("All content is an AI-assisted draft. Until a qualified reviewer is involved (ADR-0010), nothing can be");
  out("`fact-checked` or `clinically-reviewed`, so nothing is shown as complete.");
  out();

  // Manifests
  out("## Coverage against manifests");
  out();
  for (const m of manifests) {
    const expected = m.groups.flatMap((g) => g.expected);
    const written = expected.filter((id) => { const e = byId.get(id); return e && !isStub(e); }).length;
    out(`### ${m.title}`);
    out();
    out(`${m.note} Written: **${written}/${expected.length}**.`);
    out();
    out("| Group | Written | Stub | Absent | Not yet written |");
    out("|---|---|---|---|---|");
    for (const g of m.groups) {
      const state = (id: string) => { const e = byId.get(id); return !e ? "absent" : isStub(e) ? "stub" : "written"; };
      const count = (s: string) => g.expected.filter((id) => state(id) === s).length;
      const todo = g.expected.filter((id) => state(id) !== "written")
        .map((id) => "`" + id + "`" + (state(id) === "absent" ? " (absent)" : "")).join(", ");
      out(`| ${g.title} | ${count("written")}/${g.expected.length} | ${count("stub")} | ${count("absent")} | ${todo || "—"} |`);
    }
    out();
  }

  // Status of full records
  out("## Status of written records");
  out();
  out("| Record | Writing | Accuracy | Clinical | Diagram | Complete |");
  out("|---|---|---|---|---|---|");
  for (const e of full) {
    const s = e.meta.status;
    out(`| \`${e.id}\` | ${s.writing} | ${s.accuracy} | ${s.clinical} | ${s.diagram} | ${isComplete(e.meta) ? "yes" : "no"} |`);
  }
  out();

  // Missing fields
  out("## Missing optional fields");
  out();
  out("Fields that are neither filled nor marked not applicable.");
  out();
  out("| Record | Missing |");
  out("|---|---|");
  for (const e of full) {
    const missing = missingFields(e);
    if (missing.length > 0) out(`| \`${e.id}\` | ${missing.join(", ")} |`);
  }
  out();

  // Citations
  const unverified = full.reduce((n, e) => n + e.citations.length, 0);
  out("## Citations and references");
  out();
  out(`Top-level citations: **${unverified}**, all with \`locatorVerified: false\` and no locator.`);
  out();
  out("| Reference | Unconfirmed details |");
  out("|---|---|");
  for (const r of [...references].sort((a, b) => a.id.localeCompare(b.id))) {
    out(`| \`${r.id}\` — ${r.title} | ${r.unconfirmed.length > 0 ? r.unconfirmed.join(", ") : "—"} |`);
  }
  out();

  // Stubs
  out("## Stubs (referenced, not yet written)");
  out();
  for (const s of stubs) out(`- \`${s.id}\` — ${s.name}`);
  out();

  return lines.join("\n");
}
