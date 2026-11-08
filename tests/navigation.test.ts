// Breadcrumbs and "Appears in", derived from the graph (ADR-0012).

import { describe, expect, it } from "vitest";
import { entities } from "../src/content/index.ts";
import { buildGraph } from "../src/core/graph/build.ts";
import { appearsIn, breadcrumbs, referencedBy } from "../src/core/graph/navigation.ts";

const graph = buildGraph(entities);
const labels = (id: string) => breadcrumbs(graph, id).map((l) => l.label);

describe("breadcrumbs", () => {
  it("follow a nerve's branch-of chain", () => {
    expect(labels("nerve.radial")).toEqual(["Neurology", "Posterior cord of brachial plexus", "Radial nerve"]);
  });

  it("put a bone feature under its bone", () => {
    expect(breadcrumbs(graph, "feature.humerus.radial-groove")).toEqual([
      { label: "Osteology", href: "/systems/osteology" },
      { label: "Humerus", href: "/bones/humerus", entityId: "bone.humerus" },
      { label: "Radial groove" },
    ]);
  });

  it("put a muscle under its region and compartment", () => {
    expect(labels("muscle.triceps-brachii")).toEqual([
      "Myology", "Upper limb", "Posterior compartment of arm", "Triceps brachii",
    ]);
  });

  it("follow an artery to its stub parent and mark the stub", () => {
    const trail = breadcrumbs(graph, "artery.profunda-brachii");
    expect(trail[1]).toEqual({ label: "Brachial artery", href: "/arteries/brachial", entityId: "artery.brachial", stub: true });
  });

  it("put spaces and conditions under their region", () => {
    expect(labels("space.quadrangular-space")).toEqual(["Topographical anatomy", "Upper limb", "Quadrangular space"]);
    expect(labels("condition.humeral-shaft-fracture")).toEqual(["Clinical anatomy", "Upper limb", "Fracture of the humeral shaft"]);
  });

  it("have no link on the current page only", () => {
    const trail = breadcrumbs(graph, "nerve.axillary");
    expect(trail.at(-1)?.href).toBeUndefined();
    expect(trail.slice(0, -1).every((l) => l.href)).toBe(true);
  });
});

describe("appears in", () => {
  const group = (id: string, title: string) => appearsIn(graph, id).find((g) => g.title === title)?.links.map((l) => l.label);

  it("lists everything the radial nerve belongs to", () => {
    expect(group("nerve.radial", "Regions")).toEqual(["Axilla", "Arm", "Cubital fossa"]);
    expect(group("nerve.radial", "Branch of")).toEqual(["Posterior cord of brachial plexus"]);
    expect(group("nerve.radial", "Passes through")).toEqual([
      "Axilla", "Triangular interval", "Radial groove", "Anterior compartment of arm",
    ]);
    expect(group("nerve.radial", "Clinical conditions")).toEqual(["Fracture of the humeral shaft"]);
  });

  it("lists the spaces a structure bounds", () => {
    expect(group("feature.humerus.surgical-neck", "Forms boundary of")).toEqual(["Quadrangular space"]);
    expect(group("muscle.triceps-brachii", "Forms boundary of")).toEqual(["Quadrangular space"]);
    expect(group("muscle.triceps-brachii", "Compartment")).toEqual(["Posterior compartment of arm"]);
  });

  it("omits empty groups", () => {
    expect(appearsIn(graph, "compartment.arm.posterior").map((g) => g.title)).toEqual(["Regions", "Systems"]);
  });
});

describe("referenced by (stub pages)", () => {
  it("lists the records that refer to a stub", () => {
    expect(referencedBy(graph, "feature.ulna.olecranon").map((l) => l.label)).toEqual(["Triceps brachii"]);
    expect(referencedBy(graph, "space.triangular-interval").map((l) => l.label)).toEqual([
      "Profunda brachii artery", "Radial nerve",
    ]);
  });
});
