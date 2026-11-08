// Content validator (ARCHITECTURE §2 "Build-time content pipeline", ADR-0011).
// Pure logic: no React, no DOM (ADR-0005). Run by scripts/validate-content.ts.
//
// Every problem is reported with a stable rule ID so tests can check that each rule fires.

import {
  categoryPrefixes,
  fullSchemaCategories,
  isStub,
  movements,
  segments,
  type Category,
  type Citation,
  type Entity,
  type EntityId,
  type FullEntity,
  type ReferenceRecord,
  type RootValue,
} from "../../content/schema/index.ts";
import { deriveContents, isConduit } from "../graph/conduits.ts";

export type RuleId =
  | "id-format"
  | "duplicate-id"
  | "id-prefix"
  | "no-schema-for-category"
  | "required-field"
  | "unknown-region"
  | "unknown-system"
  | "dangling-reference"
  | "wrong-target-category"
  | "self-reference"
  | "stub-has-content"
  | "stub-backs-claim"
  | "prose-link"
  | "unknown-citation-reference"
  | "locator-verified-without-reviewer"
  | "locator-page-number"
  | "status-needs-review"
  | "unknown-vocabulary"
  | "roots-not-subset"
  | "predominant-not-in-typical"
  | "duplicate-segment-key"
  | "unknown-segment"
  | "origin-with-heads"
  | "duplicate-head"
  | "unknown-head"
  | "unknown-bone-part"
  | "contents-order-mismatch"
  | "frequency-needs-citation"
  | "not-applicable-filled";

export interface Issue {
  rule: RuleId;
  entityId?: string;
  path?: string;
  message: string;
}

export interface ContentInput {
  entities: readonly Entity[];
  references: readonly ReferenceRecord[];
  regionIds: readonly string[];
  systemIds: readonly string[];
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/;
/** A page number in a locator: "p. 12", "pp 12–14", "page 7", "pages", or a bare number. */
const PAGE_PATTERN = /\b(?:p|pp|page|pages)\b\.?\s*\d|^\s*\d+\s*(?:[-–]\s*\d+)?\s*$/i;
const PROSE_LINK = /\[\[([^\]]+)\]\]/g;
const BLOOD_SUPPLY_CONTRIBUTIONS: readonly string[] = ["main", "minor"];
const STUB_KEYS = new Set(["id", "category", "name", "regions", "systems", "stub", "meta"]);

// ── Reference targets ───────────────────────────────

interface RefTarget {
  path: string;
  target: EntityId;
  /** Allowed target categories; undefined = any. */
  allowed?: readonly Category[];
  /** ADR-0011 D1: the target must be a full record because the claim depends on its data. */
  requiresFull?: string;
}

const ATTACHMENT_SITES: Category[] = ["bone", "bone-feature", "fascia", "tendon", "ligament", "retinaculum", "cartilage"];
const PASSAGE_SITES: Category[] = ["space", "compartment", "bone-feature", "fascia", "retinaculum", "ligament"];

function referenceTargets(e: FullEntity): RefTarget[] {
  const refs: RefTarget[] = [];
  const add = (path: string, target: EntityId, allowed?: readonly Category[], requiresFull?: string) =>
    refs.push({ path, target, ...(allowed ? { allowed } : {}), ...(requiresFull ? { requiresFull } : {}) });

  if ("course" in e) {
    e.course.forEach((seg, i) => {
      if (seg.through) add(`course[${i}].through`, seg.through, PASSAGE_SITES);
      seg.relations.forEach((r, j) => add(`course[${i}].relations[${j}].structure`, r.structure));
    });
  }

  switch (e.category) {
    case "bone":
      break;
    case "bone-feature":
      add("bone", e.bone, ["bone"], "its partsLayout defines the feature's part");
      break;
    case "muscle":
      if (e.compartment) add("compartment", e.compartment, ["compartment"]);
      e.heads?.forEach((h, i) => h.origin.forEach((a, j) => add(`heads[${i}].origin[${j}].site`, a.site, ATTACHMENT_SITES)));
      e.origin.forEach((a, i) => add(`origin[${i}].site`, a.site, ATTACHMENT_SITES));
      e.insertion.forEach((a, i) => add(`insertion[${i}].site`, a.site, ATTACHMENT_SITES));
      e.innervation.forEach((n, i) =>
        add(`innervation[${i}].nerve`, n.nerve, ["nerve"], "root values and arisesIn are checked against the nerve"),
      );
      e.bloodSupply.forEach((b, i) => add(`bloodSupply[${i}].artery`, b.artery, ["artery"]));
      e.actions.forEach((a, i) => add(`actions[${i}].joint`, a.joint, ["joint"]));
      break;
    case "nerve":
      add("origin.from", e.origin.from, ["nerve", "plexus", "plexus-part"],
        e.origin.segment ? "origin.segment must exist on the parent's course" : undefined);
      break;
    case "artery":
      add("origin.from", e.origin.from, ["artery"],
        e.origin.segment ? "origin.segment must exist on the parent's course" : undefined);
      if (e.continuesAs) add("continuesAs", e.continuesAs, ["artery"]);
      e.anastomoses.forEach((a, i) => a.with.forEach((w, j) => add(`anastomoses[${i}].with[${j}]`, w, ["artery"])));
      if (e.pulsePoint) add("pulsePoint", e.pulsePoint, ["landmark"]);
      break;
    case "vein":
      add("drainsInto.into", e.drainsInto.into, ["vein"],
        e.drainsInto.segment ? "drainsInto.segment must exist on the receiving vein's course" : undefined);
      e.communications?.forEach((c, i) => add(`communications[${i}].with`, c.with, ["vein"]));
      break;
    case "space":
      e.boundaries.forEach((b, i) => b.formedBy.forEach((f, j) => add(`boundaries[${i}].formedBy[${j}]`, f)));
      e.communications.forEach((c, i) => add(`communications[${i}].space`, c.space, ["space", "compartment"]));
      e.surfaceLandmarks?.forEach((l, i) => add(`surfaceLandmarks[${i}]`, l, ["landmark", "bone-feature"]));
      e.contentsOrder?.order.forEach((o, i) => add(`contentsOrder.order[${i}]`, o));
      break;
    case "compartment":
      break;
    case "condition":
      e.involves.forEach((inv, i) => add(`involves[${i}].structure`, inv.structure));
      e.examination?.forEach((x, i) => add(`examination[${i}]`, x, ["exam-test"]));
      break;
  }
  return refs;
}

// ── Helpers ─────────────────────────────────────────

function allCitations(e: FullEntity): { path: string; citation: Citation }[] {
  const out: { path: string; citation: Citation }[] = [];
  e.citations.forEach((c, i) => out.push({ path: `citations[${i}]`, citation: c }));
  e.variations?.forEach((v, i) => v.citations.forEach((c, j) => out.push({ path: `variations[${i}].citations[${j}]`, citation: c })));
  if (e.category === "bone") {
    e.ossification?.citations.forEach((c, i) => out.push({ path: `ossification.citations[${i}]`, citation: c }));
  }
  if (e.category === "condition") {
    e.complications?.forEach((x, i) => x.citations.forEach((c, j) => out.push({ path: `complications[${i}].citations[${j}]`, citation: c })));
  }
  if (e.category === "nerve") collectRootCitations(e.roots, "roots", out);
  if (e.category === "muscle") e.innervation.forEach((n, i) => n.roots && collectRootCitations(n.roots, `innervation[${i}].roots`, out));
  return out;
}

function collectRootCitations(r: RootValue, path: string, out: { path: string; citation: Citation }[]) {
  r.sourcesDisagree?.citations.forEach((c, i) => out.push({ path: `${path}.sourcesDisagree.citations[${i}]`, citation: c }));
}

function rootValues(r: RootValue | undefined, path: string): { path: string; values: string[] }[] {
  if (!r) return [];
  return [{ path: `${path}.typical`, values: r.typical }, ...(r.predominant ? [{ path: `${path}.predominant`, values: r.predominant }] : [])];
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);
}

// ── Validator ───────────────────────────────────────

export function validateContent(input: ContentInput): Issue[] {
  const issues: Issue[] = [];
  const report = (rule: RuleId, entityId: string | undefined, path: string | undefined, message: string) =>
    issues.push({ rule, ...(entityId ? { entityId } : {}), ...(path ? { path } : {}), message });

  const byId = new Map<string, Entity>();
  const regionIds = new Set(input.regionIds);
  const systemIds = new Set(input.systemIds);
  const referenceIds = new Set(input.references.map((r) => r.id));
  const fullCategories = new Set<string>(fullSchemaCategories);

  // Pass 1: identity
  for (const e of input.entities) {
    if (!ID_PATTERN.test(e.id)) report("id-format", e.id, "id", `"${e.id}" is not a lowercase dotted ID like "nerve.radial"`);
    if (byId.has(e.id)) report("duplicate-id", e.id, "id", `"${e.id}" is defined more than once`);
    byId.set(e.id, e);
    const prefix = categoryPrefixes[e.category];
    if (prefix === undefined) {
      report("unknown-vocabulary", e.id, "category", `unknown category "${e.category}"`);
    } else if (!e.id.startsWith(prefix + ".")) {
      report("id-prefix", e.id, "id", `category "${e.category}" requires IDs starting with "${prefix}."`);
    }
  }

  const derivedContents = deriveContents(input.entities);

  // Pass 2: each entity
  for (const e of input.entities) {
    const id = e.id;

    // Taxonomy (stubs and full records)
    e.regions.forEach((r, i) => regionIds.has(r) || report("unknown-region", id, `regions[${i}]`, `unknown region "${r}"`));
    e.systems.forEach((s, i) => systemIds.has(s) || report("unknown-system", id, `systems[${i}]`, `unknown system "${s}"`));
    if (isBlank(e.name)) report("required-field", id, "name", "name is required");
    if (e.regions.length === 0) report("required-field", id, "regions", "at least one region is required");
    if (e.systems.length === 0) report("required-field", id, "systems", "at least one system is required");

    // Status ceiling (ADR-0003, ADR-0010)
    const reviewed = new Set((e.meta.reviews ?? []).map((r) => r.dimension));
    if (e.meta.status.accuracy === "fact-checked" && !reviewed.has("accuracy")) {
      report("status-needs-review", id, "meta.status.accuracy", `"fact-checked" requires a human accuracy review in meta.reviews`);
    }
    if (e.meta.status.clinical === "clinically-reviewed" && !reviewed.has("clinical")) {
      report("status-needs-review", id, "meta.status.clinical", `"clinically-reviewed" requires a clinical review in meta.reviews`);
    }

    if (isStub(e)) {
      const extra = Object.keys(e).filter((k) => !STUB_KEYS.has(k));
      if (extra.length > 0) report("stub-has-content", id, extra.join(", "), `stubs may not carry content fields: ${extra.join(", ")}`);
      if (e.meta.status.writing !== "not-started") report("stub-has-content", id, "meta.status.writing", `a stub's writing status must be "not-started"`);
      continue;
    }

    if (!fullCategories.has(e.category)) {
      report("no-schema-for-category", id, "category", `category "${e.category}" has no full schema yet; it can only be a stub (ADR-0011)`);
      continue;
    }
    const full = e as FullEntity;

    // Required fields
    if (isBlank(full.summary)) report("required-field", id, "summary", "summary is required");
    if (full.citations.length === 0) report("required-field", id, "citations", "at least one citation is required");
    if (full.category === "condition") {
      if (isBlank(full.mechanism)) report("required-field", id, "mechanism", "mechanism is required: every clinical fact carries its anatomical reasoning");
      if (isBlank(full.presentation)) report("required-field", id, "presentation", "presentation is required");
      if (full.involves.length === 0) report("required-field", id, "involves", "a condition must involve at least one structure");
    }

    // References
    for (const ref of referenceTargets(full)) {
      if (ref.target === id) {
        report("self-reference", id, ref.path, `refers to itself`);
        continue;
      }
      const target = byId.get(ref.target);
      if (!target) {
        report("dangling-reference", id, ref.path, `"${ref.target}" does not exist`);
        continue;
      }
      if (ref.allowed && !ref.allowed.includes(target.category)) {
        report("wrong-target-category", id, ref.path, `"${ref.target}" is a ${target.category}; expected ${ref.allowed.join(" or ")}`);
      }
      if (ref.requiresFull && isStub(target)) {
        report("stub-backs-claim", id, ref.path, `"${ref.target}" is a stub, but ${ref.requiresFull}`);
      }
    }

    // Prose links
    const text = JSON.stringify(full);
    for (const match of text.matchAll(PROSE_LINK)) {
      const target = match[1] ?? "";
      if (!byId.has(target)) report("prose-link", id, undefined, `prose link [[${target}]] does not resolve`);
    }

    // Citations
    for (const { path, citation } of allCitations(full)) {
      if (!referenceIds.has(citation.refId)) report("unknown-citation-reference", id, `${path}.refId`, `no reference record "${citation.refId}"`);
      if (citation.locatorVerified) {
        report("locator-verified-without-reviewer", id, `${path}.locatorVerified`, "locators cannot be marked verified until a reviewer exists (ADR-0010)");
      }
      if (!citation.locatorVerified && citation.locator && PAGE_PATTERN.test(citation.locator)) {
        report("locator-page-number", id, `${path}.locator`, `unverified locator "${citation.locator}" contains a page number`);
      }
    }

    // Frequencies need citations
    full.variations?.forEach((v, i) => {
      if (v.frequency !== "uncertain" && v.citations.length === 0) {
        report("frequency-needs-citation", id, `variations[${i}]`, `frequency "${v.frequency}" needs a citation`);
      }
    });
    if (full.category === "condition") {
      full.complications?.forEach((c, i) => {
        if (c.frequency !== "uncertain" && c.citations.length === 0) {
          report("frequency-needs-citation", id, `complications[${i}]`, `frequency "${c.frequency}" needs a citation`);
        }
      });
      if (full.frequency && full.frequency !== "uncertain" && !full.citations.some((c) => c.supports === "frequency")) {
        report("frequency-needs-citation", id, "frequency", `frequency "${full.frequency}" needs a citation with supports: "frequency"`);
      }
    }

    // Not-applicable fields must be empty
    for (const field of full.meta.notApplicable ?? []) {
      if (!isBlank((full as unknown as Record<string, unknown>)[field])) {
        report("not-applicable-filled", id, field, `"${field}" is marked not applicable but is filled`);
      }
    }

    // Conduits: unique segment keys, parent segment exists
    if (isConduit(full)) {
      const keys = new Set<string>();
      full.course.forEach((s, i) => {
        if (keys.has(s.key)) report("duplicate-segment-key", id, `course[${i}].key`, `segment key "${s.key}" is used twice`);
        keys.add(s.key);
      });
      const parentLink =
        full.category === "vein"
          ? { path: "drainsInto.segment", parent: full.drainsInto.into, segment: full.drainsInto.segment }
          : { path: "origin.segment", parent: full.origin.from, segment: full.origin.segment };
      if (parentLink.segment) {
        const parent = byId.get(parentLink.parent);
        if (parent && isConduit(parent) && !parent.course.some((s) => s.key === parentLink.segment)) {
          report("unknown-segment", id, parentLink.path, `"${parentLink.parent}" has no course segment "${parentLink.segment}"`);
        }
      }
    }
    if (full.category === "nerve") {
      for (const rv of rootValues(full.roots, "roots")) checkSegments(rv.values, rv.path);
      checkPredominant(full.roots, "roots");
    }

    // Muscles
    if (full.category === "muscle") {
      const headKeys = new Set<string>();
      full.heads?.forEach((h, i) => {
        if (headKeys.has(h.key)) report("duplicate-head", id, `heads[${i}].key`, `head key "${h.key}" is used twice`);
        headKeys.add(h.key);
      });
      if (full.heads && full.heads.length > 0 && full.origin.length > 0) {
        report("origin-with-heads", id, "origin", "a muscle with heads stores origins on its heads; origin must be empty");
      }
      const checkHeads = (heads: string[] | undefined, path: string) =>
        heads?.forEach((h, i) => headKeys.has(h) || report("unknown-head", id, `${path}[${i}]`, `no head "${h}" on this muscle`));

      full.innervation.forEach((n, i) => {
        const path = `innervation[${i}]`;
        checkHeads(n.heads, `${path}.heads`);
        if (n.roots) {
          for (const rv of rootValues(n.roots, `${path}.roots`)) checkSegments(rv.values, rv.path);
          checkPredominant(n.roots, `${path}.roots`);
        }
        const nerve = byId.get(n.nerve);
        if (!nerve || isStub(nerve) || nerve.category !== "nerve") return; // reported above
        // Amendment C1: roots ⊆ nerve roots
        if (n.roots) {
          for (const rv of rootValues(n.roots, `${path}.roots`)) {
            const outside = rv.values.filter((s) => !nerve.roots.typical.includes(s as never));
            if (outside.length > 0) {
              report("roots-not-subset", id, rv.path, `${outside.join(", ")} not among the roots of ${nerve.id} (${nerve.roots.typical.join(", ")})`);
            }
          }
        }
        // Amendment C2: arisesIn exists on that nerve
        if (n.arisesIn && !nerve.course.some((s) => s.key === n.arisesIn)) {
          report("unknown-segment", id, `${path}.arisesIn`, `"${nerve.id}" has no course segment "${n.arisesIn}"`);
        }
      });
      full.bloodSupply.forEach((b, i) => {
        checkHeads(b.heads, `bloodSupply[${i}].heads`);
        if (b.contribution !== undefined && !BLOOD_SUPPLY_CONTRIBUTIONS.includes(b.contribution)) {
          report("unknown-vocabulary", id, `bloodSupply[${i}].contribution`, `unknown contribution "${b.contribution}"; use "main" or "minor"`);
        }
      });
      full.actions.forEach((a, i) => {
        checkHeads(a.heads, `actions[${i}].heads`);
        if (!(movements as readonly string[]).includes(a.movement)) {
          report("unknown-vocabulary", id, `actions[${i}].movement`, `unknown movement "${a.movement}"`);
        }
      });
    }

    // Bone features: part exists on the bone
    if (full.category === "bone-feature") {
      const bone = byId.get(full.bone);
      if (bone && !isStub(bone) && bone.category === "bone" && !bone.partsLayout.some((p) => p.key === full.part)) {
        report("unknown-bone-part", id, "part", `"${full.bone}" has no part "${full.part}"`);
      }
    }

    // Amendment C3: contentsOrder is a permutation of derived contents
    if (full.category === "space" && full.contentsOrder) {
      const derived = [...(derivedContents.get(id) ?? [])].sort();
      const ordered = [...full.contentsOrder.order].sort();
      if (derived.length !== ordered.length || derived.some((d, i) => d !== ordered[i])) {
        report("contents-order-mismatch", id, "contentsOrder.order",
          `contentsOrder [${full.contentsOrder.order.join(", ")}] is not a permutation of the derived contents [${derived.join(", ")}]`);
      }
    }

    function checkSegments(values: string[], path: string) {
      values.forEach((v, i) => (segments as readonly string[]).includes(v) || report("unknown-vocabulary", id, `${path}[${i}]`, `unknown segment "${v}"`));
    }
    function checkPredominant(r: RootValue, path: string) {
      const outside = (r.predominant ?? []).filter((p) => !r.typical.includes(p));
      if (outside.length > 0) report("predominant-not-in-typical", id, `${path}.predominant`, `${outside.join(", ")} not in typical roots`);
    }
  }

  return issues;
}

export function formatIssue(issue: Issue): string {
  const where = [issue.entityId, issue.path].filter(Boolean).join(" → ");
  return `[${issue.rule}] ${where ? where + ": " : ""}${issue.message}`;
}
