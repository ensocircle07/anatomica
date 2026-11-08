// The list of routes. Pure logic: no React, no DOM (ADR-0005).
//
// Used in two places:
//   1. The React app, to set each page's <title>, description and robots tag.
//   2. scripts/generate-route-shells.ts, which writes a real index.html for every route
//      so that direct links and refreshes work on GitHub Pages (ADR-0006).
//
// Entity routes are generated from content (ADR-0012 §1); their indexing follows review status (§6).

import { entities } from "../content/index.ts";
import { isStub, type Entity, type EntityId } from "../content/schema/index.ts";
import { isIndexable } from "./status.ts";
import { entityPath } from "./urls.ts";
import { hubRoutes } from "./hubs.ts";

export interface RouteMeta {
  /** Path inside the app, always starting with "/" and without a trailing slash. */
  path: string;
  /** Text for the browser tab and search results. */
  title: string;
  /** One-sentence summary for search engines and link previews. */
  description: string;
  /** false → `<meta name="robots" content="noindex">`. */
  indexable: boolean;
  /** Set for entity pages. */
  entityId?: EntityId;
}

export const SUFFIX = " — ANATOMICA";

export const staticRoutes: readonly RouteMeta[] = [
  {
    path: "/",
    title: "ANATOMICA — The Clinical Anatomy Atlas",
    description:
      "An interactive clinical anatomy atlas connecting every structure to its relations, supply, function and clinical consequences.",
    indexable: true,
  },
  {
    path: "/about",
    title: "About" + SUFFIX,
    description: "What ANATOMICA is, how it is built, and the status of its content.",
    indexable: true,
  },
  {
    path: "/about/build",
    title: "Build information" + SUFFIX,
    description: "Which version of ANATOMICA is currently deployed.",
    indexable: true,
  },
];

export function entityRoutes(list: readonly Entity[]): RouteMeta[] {
  return list.map((e) => ({
    path: entityPath(e),
    title: e.name + SUFFIX,
    description: isStub(e)
      ? `${e.name}: not yet written in ANATOMICA.`
      : e.summary,
    indexable: isIndexable(e),
    entityId: e.id,
  }));
}

/** Region and system hubs: non-entity pages, always indexable (ADR-0012 §6). */
export const hubRouteList: readonly RouteMeta[] = hubRoutes().map((h) => ({
  path: h.path,
  title: h.title + SUFFIX,
  description: h.description,
  indexable: true,
}));

export const allRoutes: readonly RouteMeta[] = [...staticRoutes, ...hubRouteList, ...entityRoutes(entities)];

const byPath = new Map(allRoutes.map((r) => [r.path, r] as const));

/** Finds the metadata for a path. Ignores a trailing slash. */
export function findRoute(path: string): RouteMeta | undefined {
  const normalised = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return byPath.get(normalised);
}
