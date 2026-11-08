// Failing-example tests for the content validator (ADR-0011).
// Each case copies the real seed content, breaks exactly one thing, and checks that the expected
// rule — and only that rule — fires. The unmodified seed must pass with no issues.

import { describe, expect, it } from "vitest";
import { entities, references, regions, systems } from "../src/content/index.ts";
import { validateContent, type RuleId } from "../src/core/validate/validate.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Draft = any;

function run(mutate?: (all: Draft[]) => void) {
  const copy: Draft[] = structuredClone(entities);
  mutate?.(copy);
  return validateContent({
    entities: copy,
    references,
    regionIds: regions.map((r) => r.id),
    systemIds: systems.map((s) => s.id),
  });
}

function get(all: Draft[], id: string): Draft {
  const found = all.find((e) => e.id === id);
  if (!found) throw new Error(`test setup: no entity ${id}`);
  return found;
}

function stubOf(id: string, category: string): Draft {
  return {
    id, category, name: "Test", regions: ["upper-limb.arm"], systems: ["myology"], stub: true,
    meta: { status: { writing: "not-started", accuracy: "unchecked", clinical: "none", diagram: "none" }, updated: "2026-11-08" },
  };
}

describe("seed content", () => {
  it("passes validation with no issues", () => {
    expect(run()).toEqual([]);
  });
});

const failing: { name: string; rule: RuleId; mutate: (all: Draft[]) => void }[] = [
  // Identity
  { name: "duplicate ID", rule: "duplicate-id",
    mutate: (all) => all.push(structuredClone(get(all, "bone.humerus"))) },
  { name: "malformed ID", rule: "id-format",
    mutate: (all) => all.push(stubOf("muscle.Bad_Name", "muscle")) },
  { name: "ID prefix does not match category", rule: "id-prefix",
    mutate: (all) => all.push(stubOf("artery.not-really", "nerve")) },
  { name: "full record in a category without a schema", rule: "no-schema-for-category",
    mutate: (all) => { delete get(all, "joint.elbow").stub; } },

  // Required fields and taxonomy
  { name: "condition without a mechanism", rule: "required-field",
    mutate: (all) => { get(all, "condition.humeral-shaft-fracture").mechanism = ""; } },
  { name: "unknown region", rule: "unknown-region",
    mutate: (all) => { get(all, "bone.humerus").regions.push("upper-limb.elbow"); } },
  { name: "unknown system", rule: "unknown-system",
    mutate: (all) => { get(all, "bone.humerus").systems.push("syndesmology"); } },

  // References
  { name: "reference to a missing entity", rule: "dangling-reference",
    mutate: (all) => { get(all, "muscle.triceps-brachii").insertion[0].site = "feature.ulna.olecranonn"; } },
  { name: "reference to the wrong category", rule: "wrong-target-category",
    mutate: (all) => { get(all, "muscle.triceps-brachii").bloodSupply[0].artery = "nerve.radial"; } },
  { name: "entity referring to itself", rule: "self-reference",
    mutate: (all) => { get(all, "nerve.radial").course[0].relations[0].structure = "nerve.radial"; } },
  { name: "unresolved prose link", rule: "prose-link",
    mutate: (all) => { get(all, "bone.humerus").sections.overview += " See [[nerve.ulnar]]."; } },

  // Stubs (ADR-0011 D1, amendment C4)
  { name: "stub carrying content", rule: "stub-has-content",
    mutate: (all) => { get(all, "joint.elbow").summary = "A hinge joint."; } },
  { name: "stub with a writing status other than not-started", rule: "stub-has-content",
    mutate: (all) => { get(all, "joint.elbow").meta.status.writing = "in-progress"; } },
  { name: "innervation pointing to a stub nerve", rule: "stub-backs-claim",
    mutate: (all) => {
      const i = all.findIndex((e) => e.id === "nerve.musculocutaneous");
      all[i] = stubOf("nerve.musculocutaneous", "nerve");
    } },

  // Citations and status
  { name: "citation to an unknown reference", rule: "unknown-citation-reference",
    mutate: (all) => { get(all, "nerve.radial").citations[0].refId = "ref.not-a-book"; } },
  { name: "locator marked verified before a reviewer exists", rule: "locator-verified-without-reviewer",
    mutate: (all) => { get(all, "nerve.radial").citations[0].locatorVerified = true; } },
  { name: "unverified locator with a page number", rule: "locator-page-number",
    mutate: (all) => { get(all, "nerve.radial").citations[0].locator = "p. 1"; } },
  { name: "fact-checked without a review", rule: "status-needs-review",
    mutate: (all) => { get(all, "nerve.radial").meta.status.accuracy = "fact-checked"; } },
  { name: "clinically-reviewed without a review", rule: "status-needs-review",
    mutate: (all) => { get(all, "nerve.radial").meta.status.clinical = "clinically-reviewed"; } },
  { name: "frequency without a citation", rule: "frequency-needs-citation",
    mutate: (all) => {
      const v = get(all, "muscle.triceps-brachii").variations[0];
      v.frequency = "common";
      v.citations = [];
    } },
  { name: "not-applicable field that is filled", rule: "not-applicable-filled",
    mutate: (all) => { get(all, "bone.humerus").radiology = "Seen on AP and lateral views."; } },

  // Roots (amendment C1)
  { name: "muscle root outside the nerve's roots", rule: "roots-not-subset",
    mutate: (all) => { get(all, "muscle.brachialis").innervation[0].roots.typical = ["C5", "C6", "C8"]; } },
  { name: "predominant root not among typical roots", rule: "predominant-not-in-typical",
    mutate: (all) => { get(all, "muscle.triceps-brachii").innervation[0].roots.predominant = ["T1"]; } },
  { name: "unknown spinal segment", rule: "unknown-vocabulary",
    mutate: (all) => { get(all, "nerve.radial").roots.typical.push("C9"); } },

  // Segments (amendment C2)
  { name: "arisesIn not on the nerve's course", rule: "unknown-segment",
    mutate: (all) => { get(all, "muscle.triceps-brachii").innervation[1].arisesIn = "spiral-groove"; } },
  { name: "origin.segment not on the parent's course", rule: "unknown-segment",
    mutate: (all) => { get(all, "artery.profunda-brachii").origin = { from: "artery.posterior-circumflex-humeral", segment: "nowhere" }; } },
  { name: "duplicate course segment key", rule: "duplicate-segment-key",
    mutate: (all) => { get(all, "nerve.axillary").course[2].key = "axilla"; } },

  // Muscles
  { name: "origin stored on both the muscle and its heads", rule: "origin-with-heads",
    mutate: (all) => { get(all, "muscle.triceps-brachii").origin = [{ site: "feature.ulna.olecranon" }]; } },
  { name: "reference to a head that does not exist", rule: "unknown-head",
    mutate: (all) => { get(all, "muscle.triceps-brachii").actions[1].heads = ["short"]; } },
  { name: "duplicate head key", rule: "duplicate-head",
    mutate: (all) => {
      const heads = get(all, "muscle.triceps-brachii").heads;
      heads.push({ ...structuredClone(heads[0]), name: "Second long head" });
    } },
  { name: "unknown movement", rule: "unknown-vocabulary",
    mutate: (all) => { get(all, "muscle.brachialis").actions[0].movement = "bending"; } },

  // Bone features
  { name: "feature on a part the bone does not have", rule: "unknown-bone-part",
    mutate: (all) => { get(all, "feature.humerus.radial-groove").part = "middle-third"; } },

  // Spaces (amendment C3)
  { name: "contentsOrder missing a derived content", rule: "contents-order-mismatch",
    mutate: (all) => { get(all, "space.quadrangular-space").contentsOrder = { axis: "superior to inferior", order: ["nerve.axillary"] }; } },
  { name: "contentsOrder with an extra structure", rule: "contents-order-mismatch",
    mutate: (all) => {
      get(all, "space.quadrangular-space").contentsOrder = {
        axis: "superior to inferior", order: ["nerve.axillary", "artery.posterior-circumflex-humeral", "nerve.radial"],
      };
    } },
];

describe("validator rejects each failing example", () => {
  it.each(failing)("$name → $rule", ({ rule, mutate }) => {
    const issues = run(mutate);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.map((i) => i.rule)).toEqual(issues.map(() => rule));
  });
});

describe("validator accepts valid variants", () => {
  it("accepts contentsOrder that is a permutation of derived contents", () => {
    const issues = run((all) => {
      get(all, "space.quadrangular-space").contentsOrder = {
        axis: "superior to inferior", order: ["artery.posterior-circumflex-humeral", "nerve.axillary"],
      };
    });
    expect(issues).toEqual([]);
  });

  it("accepts a locator without a page number", () => {
    const issues = run((all) => { get(all, "nerve.radial").citations[0].locator = "Upper limb chapter"; });
    expect(issues).toEqual([]);
  });

  it("accepts fact-checked when a human review is recorded", () => {
    const issues = run((all) => {
      const meta = get(all, "nerve.radial").meta;
      meta.status.accuracy = "fact-checked";
      meta.reviews = [{ dimension: "accuracy", by: "Reviewer", date: "2026-11-08" }];
    });
    expect(issues).toEqual([]);
  });

  it("accepts innervation roots that are a subset of the nerve's roots", () => {
    const issues = run((all) => { get(all, "muscle.brachialis").innervation[0].roots.typical = ["C5", "C6", "C7"]; });
    expect(issues).toEqual([]);
  });
});
