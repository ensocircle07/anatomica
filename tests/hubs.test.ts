import { describe, expect, it } from "vitest";
import { entities } from "../src/content/index.ts";
import { buildGraph } from "../src/core/graph/build.ts";
import { groupForHub, inRegion, inSystem, subregionsOf, summarise } from "../src/core/hubs.ts";
import { parseProse } from "../src/core/prose.ts";
import { formatRoots, humanise } from "../src/core/labels.ts";
import { allRoutes } from "../src/core/routes.ts";

const graph = buildGraph(entities);

describe("hubs", () => {
  it("include subregion records in a region", () => {
    const arm = inRegion(entities, "upper-limb.arm").map((e) => e.id);
    const limb = inRegion(entities, "upper-limb").map((e) => e.id);
    expect(arm).toContain("muscle.triceps-brachii");
    expect(limb).toEqual(expect.arrayContaining(arm));
    expect(inRegion(entities, "head")).toEqual([]);
  });

  it("count written records and stubs separately", () => {
    expect(summarise(inSystem(entities, "neurology"))).toEqual({ written: 3, notYetWritten: 2 });
  });

  it("group muscles by compartment, written records first", () => {
    const groups = groupForHub(graph, inRegion(entities, "upper-limb.arm")).filter((g) => g.category === "muscle");
    expect(groups.map((g) => g.title)).toEqual([
      "Muscles — Anterior compartment of arm",
      "Muscles — Posterior compartment of arm",
      "Muscles — compartment not yet recorded",
    ]);
    expect(groups[0]?.items[0]).toEqual({ id: "muscle.brachialis", name: "Brachialis", stub: false });
  });

  it("list subregions of the upper limb", () => {
    expect(subregionsOf("upper-limb").map((r) => r.name)).toEqual([
      "Shoulder", "Axilla", "Arm", "Cubital fossa", "Forearm", "Wrist", "Hand",
    ]);
  });

  it("are routable and indexable", () => {
    const hub = allRoutes.find((r) => r.path === "/regions/upper-limb/arm");
    expect(hub?.indexable).toBe(true);
    expect(allRoutes.find((r) => r.path === "/systems/clinical")?.indexable).toBe(true);
  });
});

describe("prose and labels", () => {
  it("split prose into paragraphs and links", () => {
    expect(parseProse("Runs in the [[feature.humerus.radial-groove]].\n\nSecond.")).toEqual([
      [{ text: "Runs in the " }, { link: "feature.humerus.radial-groove" }, { text: "." }],
      [{ text: "Second." }],
    ]);
  });

  it("format labels", () => {
    expect(humanise("medial-rotation")).toBe("Medial rotation");
    expect(formatRoots({ typical: ["C6", "C7", "C8"], predominant: ["C7"] })).toBe("C6, C7, C8 (mainly C7)");
  });
});
