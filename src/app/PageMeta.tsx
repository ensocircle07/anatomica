import { useEffect } from "react";
import { findRoute } from "../core/routes.ts";

interface PageMetaProps {
  /** Look up title and description from the route list (src/core/routes.ts). */
  path?: string;
  /** Or give them directly (e.g. for the "not found" page). */
  title?: string;
  description?: string;
}

// Updates the browser-tab title and the meta description when a page is shown.
// The static versions in index.html (and in each generated route shell) are
// what search engines and link previews see before JavaScript runs.
export function PageMeta({ path, title, description }: PageMetaProps) {
  const route = path ? findRoute(path) : undefined;
  const finalTitle = title ?? route?.title;
  const finalDescription = description ?? route?.description;

  useEffect(() => {
    if (finalTitle) document.title = finalTitle;
    if (finalDescription) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", finalDescription);
    }
  }, [finalTitle, finalDescription]);

  return null;
}
