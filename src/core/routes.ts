// The list of static routes. Pure logic: no React, no DOM (ADR-0005).
//
// Used in two places:
//   1. The React app, to set each page's <title>.
//   2. scripts/generate-route-shells.ts, which writes a real index.html for
//      every route so that direct links and refreshes work on GitHub Pages (ADR-0006).
//
// From Milestone 3 onwards, entity routes will be generated from content and
// added to this list automatically.

export interface RouteMeta {
  /** Path inside the app, always starting with "/" and without a trailing slash. */
  path: string;
  /** Text for the browser tab and search results. */
  title: string;
  /** One-sentence summary for search engines and link previews. */
  description: string;
}

const SUFFIX = " — ANATOMICA";

export const staticRoutes: readonly RouteMeta[] = [
  {
    path: "/",
    title: "ANATOMICA — The Clinical Anatomy Atlas",
    description:
      "An interactive clinical anatomy atlas connecting every structure to its relations, supply, function and clinical consequences.",
  },
  {
    path: "/about",
    title: "About" + SUFFIX,
    description: "What ANATOMICA is, how it is built, and the status of its content.",
  },
  {
    path: "/about/build",
    title: "Build information" + SUFFIX,
    description: "Which version of ANATOMICA is currently deployed.",
  },
];

/** Finds the metadata for a path. Ignores a trailing slash. */
export function findRoute(path: string): RouteMeta | undefined {
  const normalised = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return staticRoutes.find((route) => route.path === normalised);
}
