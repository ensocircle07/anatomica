import { describe, expect, it } from "vitest";
import { entities } from "../src/content/index.ts";
import { allRoutes, entityRoutes, findRoute, staticRoutes } from "../src/core/routes.ts";
import { entityPath } from "../src/core/urls.ts";
import { isIndexable } from "../src/core/status.ts";
import { escapeHtml, renderShell, shellFilePath } from "../scripts/route-shells.ts";

describe("routes", () => {
  it("have unique paths that start with / and have no trailing slash", () => {
    const paths = allRoutes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path.startsWith("/")).toBe(true);
      if (path !== "/") expect(path.endsWith("/")).toBe(false);
    }
  });

  it("include the home page and a nested route", () => {
    expect(findRoute("/")).toBeDefined();
    expect(staticRoutes.some((r) => r.path.split("/").length > 2)).toBe(true);
  });

  it("are found with or without a trailing slash", () => {
    expect(findRoute("/about/build")?.title).toBe("Build information — ANATOMICA");
    expect(findRoute("/about/build/")?.title).toBe("Build information — ANATOMICA");
    expect(findRoute("/does-not-exist")).toBeUndefined();
  });

  it("include one route per entity, including stubs", () => {
    expect(entityRoutes(entities)).toHaveLength(entities.length);
    expect(findRoute("/nerves/radial")?.entityId).toBe("nerve.radial");
    expect(findRoute("/joints/elbow")?.entityId).toBe("joint.elbow");
  });
});

describe("entity URLs come from IDs (ADR-0012 §1)", () => {
  it.each([
    ["nerve.radial", "nerve", "/nerves/radial"],
    ["bone.humerus", "bone", "/bones/humerus"],
    ["feature.humerus.radial-groove", "bone-feature", "/bones/humerus/radial-groove"],
    ["compartment.arm.posterior", "compartment", "/compartments/arm/posterior"],
    ["condition.humeral-shaft-fracture", "condition", "/clinical/humeral-shaft-fracture"],
    ["plexus-part.brachial.posterior-cord", "plexus-part", "/plexuses/brachial/posterior-cord"],
  ] as const)("%s → %s", (id, category, path) => {
    expect(entityPath({ id, category })).toBe(path);
  });

  it("rejects an ID that does not match its category", () => {
    expect(() => entityPath({ id: "artery.radial", category: "nerve" })).toThrow();
  });
});

describe("indexing follows review status (ADR-0012 §6)", () => {
  const meta = (accuracy: "unchecked" | "cross-checked" | "fact-checked") => ({
    status: { writing: "draft-complete" as const, accuracy, clinical: "none" as const, diagram: "none" as const },
    updated: "2026-11-08",
  });

  it("keeps unchecked records and stubs out of search engines", () => {
    expect(isIndexable({ meta: meta("unchecked") })).toBe(false);
    expect(isIndexable({ meta: meta("cross-checked"), stub: true })).toBe(false);
  });

  it("indexes records once accuracy is above unchecked", () => {
    expect(isIndexable({ meta: meta("cross-checked") })).toBe(true);
    expect(isIndexable({ meta: meta("fact-checked") })).toBe(true);
  });

  it("marks every current entity route noindex and every static route indexable", () => {
    expect(allRoutes.filter((r) => r.entityId).every((r) => !r.indexable)).toBe(true);
    expect(staticRoutes.every((r) => r.indexable)).toBe(true);
  });
});

describe("route shells", () => {
  const template =
    '<html><head><title>Old</title>\n<meta name="description" content="Old description" />\n' +
    '<meta name="robots" content="index, follow" /></head><body></body></html>';

  it("replace the title, description and robots tag", () => {
    const html = renderShell(template, { title: "About — ANATOMICA", description: "New description", indexable: true });
    expect(html).toContain("<title>About — ANATOMICA</title>");
    expect(html).toContain('<meta name="description" content="New description" />');
    expect(html).toContain('<meta name="robots" content="index, follow" />');
    expect(html).not.toContain("Old");
  });

  it("write noindex for pages that must not be indexed", () => {
    const html = renderShell(template, { title: "Radial nerve — ANATOMICA", description: "x", indexable: false });
    expect(html).toContain('<meta name="robots" content="noindex, follow" />');
  });

  it("escape HTML special characters", () => {
    expect(escapeHtml('<b>"A" & B</b>')).toBe("&lt;b&gt;&quot;A&quot; &amp; B&lt;/b&gt;");
  });

  it("fail loudly if the template is missing a tag", () => {
    expect(() => renderShell("<html></html>", { title: "x", description: "y", indexable: true })).toThrow();
  });

  it("map paths to files", () => {
    expect(shellFilePath("/")).toBe("index.html");
    expect(shellFilePath("/about")).toBe("about/index.html");
    expect(shellFilePath("/about/build")).toBe("about/build/index.html");
    expect(shellFilePath("/bones/humerus/radial-groove")).toBe("bones/humerus/radial-groove/index.html");
  });
});
