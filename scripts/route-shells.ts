// Pure helpers for generate-route-shells.ts (kept separate so they can be unit-tested).

import type { RouteMeta } from "../src/core/routes.ts";

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const TITLE_PATTERN = /<title>[\s\S]*?<\/title>/;
const DESCRIPTION_PATTERN = /<meta name="description" content="[^"]*"\s*\/?>/;
const ROBOTS_PATTERN = /<meta name="robots" content="[^"]*"\s*\/?>/;

/**
 * Returns a copy of the built index.html with the route's own <title>, meta
 * description and robots tag. Throws if the template is missing any of them, so a
 * broken template fails the build instead of silently producing bad pages.
 */
export function renderShell(templateHtml: string, route: Pick<RouteMeta, "title" | "description" | "indexable">): string {
  if (!TITLE_PATTERN.test(templateHtml)) {
    throw new Error("index.html template has no <title> element");
  }
  if (!DESCRIPTION_PATTERN.test(templateHtml)) {
    throw new Error('index.html template has no <meta name="description"> element');
  }
  if (!ROBOTS_PATTERN.test(templateHtml)) {
    throw new Error('index.html template has no <meta name="robots"> element');
  }
  const robots = route.indexable ? "index, follow" : "noindex, follow";
  return templateHtml
    .replace(TITLE_PATTERN, `<title>${escapeHtml(route.title)}</title>`)
    .replace(DESCRIPTION_PATTERN, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace(ROBOTS_PATTERN, `<meta name="robots" content="${robots}" />`);
}

/** "/" → "index.html"; "/about/build" → "about/build/index.html" */
export function shellFilePath(routePath: string): string {
  const trimmed = routePath.replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "index.html" : `${trimmed}/index.html`;
}
