// Smoke test (ADR-0012 §5): renders EVERY generated route with react-dom/server and fails on
// - any thrown error,
// - any React console error or warning,
// - a page without exactly one <h1>,
// - a skipped heading level (e.g. h2 → h4).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { AppRoutes } from "./AppRoutes.tsx";
import { allRoutes } from "../core/routes.ts";

function render(path: string): string {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

function headingLevels(html: string): number[] {
  return [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
}

let consoleProblems: string[] = [];

beforeEach(() => {
  consoleProblems = [];
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => consoleProblems.push(args.map(String).join(" ")));
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => consoleProblems.push(args.map(String).join(" ")));
});

afterEach(() => {
  vi.restoreAllMocks();
});

const paths = [...allRoutes.map((r) => r.path), "/this-page-does-not-exist"];

describe("every route renders on the server", () => {
  it.each(paths)("%s", (path) => {
    const html = render(path);
    expect(consoleProblems, consoleProblems.join("\n")).toEqual([]);

    const levels = headingLevels(html);
    expect(levels.filter((l) => l === 1), "exactly one <h1>").toHaveLength(1);
    expect(levels[0], "the <h1> comes first").toBe(1);
    levels.forEach((level, i) => {
      if (i > 0) expect(level, `heading h${level} after h${levels[i - 1]} skips a level`).toBeLessThanOrEqual(levels[i - 1]! + 1);
    });

    expect(html).toContain('href="#main"'); // skip-to-content link
  });

  it("renders the not-found page for unknown paths", () => {
    expect(render("/this-page-does-not-exist")).toContain("Page not found");
  });

  it("renders an entity page with its name as the heading", () => {
    expect(render("/nerves/radial")).toMatch(/<h1[^>]*>Radial nerve<\/h1>/);
  });

  it("renders the category-specific sections", () => {
    const nerve = render("/nerves/radial");
    expect(nerve).toContain("If injured at");
    expect(nerve).toContain("Muscles supplied");
    expect(render("/muscles/brachialis")).toContain("minor");
    expect(render("/clinical/humeral-shaft-fracture")).toContain("Why it happens");
    expect(render("/spaces/quadrangular-space")).toContain("Posterior circumflex humeral artery");
    expect(render("/bones/humerus")).toContain("Muscle attachments");
    expect(render("/joints/elbow")).toContain("Referenced by");
  });

  it("renders hubs with their records", () => {
    expect(render("/regions/upper-limb/arm")).toContain("Triceps brachii");
    expect(render("/systems/neurology")).toContain("Radial nerve");
  });
});
