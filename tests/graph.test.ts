// Graph builder tests: every relationship stored on one side is generated on the other (ADR-0011).

import { describe, expect, it } from "vitest";
import { entities, references } from "../src/content/index.ts";
import { manifests } from "../src/content/manifests/upper-limb-seed.ts";
import { buildGraph } from "../src/core/graph/build.ts";
import { antagonists, deficitsAtLesion, summariseLesion, synergists } from "../src/core/graph/queries.ts";
import { innervationDistractorConflicts, nervesSupplying } from "../src/core/quiz/distractors.ts";
import { buildCoverageReport } from "../src/core/coverage/report.ts";
import { isComplete } from "../src/core/status.ts";

const graph = buildGraph(entities);

describe("muscles supplied (from Muscle.innervation)", () => {
  it("lists brachialis under the radial nerve as a minor contribution", () => {
    const entry = graph.musclesSupplied.get("nerve.radial")?.find((m) => m.muscle === "muscle.brachialis");
    expect(entry?.contribution).toBe("minor");
  });

  it("lists brachialis under the musculocutaneous nerve as the main contribution", () => {
    const entry = graph.musclesSupplied.get("nerve.musculocutaneous")?.find((m) => m.muscle === "muscle.brachialis");
    expect(entry?.contribution).toBe("main");
  });

  it("lists triceps once under the radial nerve, with all heads and both branch levels", () => {
    const entries = graph.musclesSupplied.get("nerve.radial")?.filter((m) => m.muscle === "muscle.triceps-brachii") ?? [];
    expect(entries).toHaveLength(1);
    expect(entries[0]?.contribution).toBe("main");
    expect(entries[0]?.heads?.sort()).toEqual(["lateral", "long", "medial"]);
    expect(entries[0]?.arisesIn).toEqual(["axilla", "radial-groove"]);
  });
});

describe("contents (from course[].through)", () => {
  it("derives the quadrangular space contents from the axillary nerve and posterior circumflex humeral artery", () => {
    expect(graph.contents.get("space.quadrangular-space")?.sort()).toEqual(
      ["artery.posterior-circumflex-humeral", "nerve.axillary"],
    );
    // The space itself stores no contents: they come only from the conduits' `through` fields.
    expect(graph.byId.get("space.quadrangular-space")).not.toHaveProperty("contents");
  });

  it("derives the radial groove contents (nerve and artery) as 'transmits'", () => {
    expect(graph.contents.get("feature.humerus.radial-groove")?.sort()).toEqual(["artery.profunda-brachii", "nerve.radial"]);
  });

  it("lists what the radial nerve passes through, proximal to distal", () => {
    expect(graph.passesThrough.get("nerve.radial")).toEqual([
      "space.axilla", "space.triangular-interval", "feature.humerus.radial-groove", "compartment.arm.anterior",
    ]);
  });
});

describe("other reverse relationships", () => {
  it("lists the humerus features in partsLayout order", () => {
    expect(graph.features.get("bone.humerus")).toEqual([
      "feature.humerus.surgical-neck", "feature.humerus.radial-groove", "feature.humerus.posterior-surface",
    ]);
  });

  it("lists the posterior surface attachments by head", () => {
    const att = graph.attachments.get("feature.humerus.posterior-surface") ?? [];
    expect(att.map((a) => `${a.muscle}:${a.head}`).sort()).toEqual([
      "muscle.triceps-brachii:lateral", "muscle.triceps-brachii:medial",
    ]);
  });

  it("lists branches of the posterior cord", () => {
    expect(graph.branches.get("plexus-part.brachial.posterior-cord")?.map((b) => b.child).sort()).toEqual([
      "nerve.axillary", "nerve.radial",
    ]);
  });

  it("lists spaces a structure bounds", () => {
    expect(graph.boundaryOf.get("feature.humerus.surgical-neck")).toEqual([
      { space: "space.quadrangular-space", side: "lateral" },
    ]);
  });

  it("lists the profunda brachii as a main supply to triceps", () => {
    expect(graph.supplies.get("artery.profunda-brachii")).toEqual([
      { muscle: "muscle.triceps-brachii", contribution: "main" },
    ]);
  });

  it("leaves unconfirmed blood supply contributions unset", () => {
    expect(graph.supplies.get("artery.posterior-circumflex-humeral")).toEqual([
      { muscle: "muscle.triceps-brachii", heads: ["long", "lateral"] },
    ]);
  });

  it("lists muscles supplied by an artery and in a compartment", () => {
    expect(graph.supplies.get("artery.profunda-brachii")?.map((s) => s.muscle)).toEqual(["muscle.triceps-brachii"]);
    expect(graph.compartmentMuscles.get("compartment.arm.posterior")).toEqual(["muscle.triceps-brachii"]);
  });

  it("lists clinical significance from Condition.involves", () => {
    expect(graph.clinical.get("nerve.radial")).toEqual([
      { condition: "condition.humeral-shaft-fracture", role: "endangered" },
    ]);
  });

  it("derives antagonists from opposite movements at the same joint", () => {
    expect(antagonists(graph, "muscle.brachialis")).toEqual([
      { muscle: "muscle.triceps-brachii", joint: "joint.elbow", movement: "extension" },
    ]);
    expect(synergists(graph, "muscle.brachialis")).toEqual([]);
  });
});

describe("distractor check (brachialis seed case)", () => {
  it("knows both nerves that supply brachialis", () => {
    expect(Object.fromEntries(nervesSupplying(graph, "muscle.brachialis"))).toEqual({
      "nerve.musculocutaneous": "main",
      "nerve.radial": "minor",
    });
  });

  it("rejects the radial nerve as a wrong answer for 'Which nerve supplies brachialis?'", () => {
    expect(innervationDistractorConflicts(graph, "muscle.brachialis", ["nerve.radial", "nerve.axillary"])).toEqual([
      { distractor: "nerve.radial", contribution: "minor" },
    ]);
  });

  it("accepts the axillary nerve as a genuine distractor", () => {
    expect(innervationDistractorConflicts(graph, "muscle.brachialis", ["nerve.axillary"])).toEqual([]);
  });
});

describe("lesion level (radial nerve in the radial groove)", () => {
  const rows = deficitsAtLesion(graph, "nerve.radial", "radial-groove");
  const summary = summariseLesion(rows);

  it("spares the triceps branch that arises in the axilla", () => {
    expect(rows).toContainEqual(expect.objectContaining({
      muscle: "muscle.triceps-brachii", outcome: "spared", heads: ["long", "medial"],
    }));
  });

  it("marks the triceps branch arising within the groove as possibly affected", () => {
    expect(rows).toContainEqual(expect.objectContaining({
      muscle: "muscle.triceps-brachii", outcome: "possibly-affected", heads: ["lateral", "medial"],
    }));
  });

  it("loses the radial supply to brachialis, which keeps its musculocutaneous supply", () => {
    expect(rows).toContainEqual(expect.objectContaining({
      muscle: "muscle.brachialis", outcome: "lost", contribution: "minor", otherSupply: ["nerve.musculocutaneous"],
    }));
    expect(summary.get("muscle.brachialis")).toBe("lost");
  });

  it("rejects an unknown segment", () => {
    expect(() => deficitsAtLesion(graph, "nerve.radial", "forearm")).toThrow();
  });
});

describe("status and coverage", () => {
  it("never computes AI-drafted content as complete", () => {
    expect(entities.filter((e) => isComplete(e.meta))).toEqual([]);
  });

  it("produces a deterministic report that counts stubs as not written", () => {
    const a = buildCoverageReport({ entities, references, manifests });
    const b = buildCoverageReport({ entities, references, manifests });
    expect(a).toBe(b);
    expect(a).toContain("| Arm — muscles | 2/4 | 2 | 0 |");
    expect(a).toContain("bloodSupply[0].contribution (artery.brachial)");
    expect(a).not.toContain("contribution (artery.profunda-brachii)");
  });
});
