import { useEffect } from "react";
import { findRoute } from "../core/routes.ts";

interface PageMetaProps {
  /** Look up title, description and indexing from the route list (src/core/routes.ts). */
  path?: string;
  /** Or give them directly (e.g. for the "not found" page). */
  title?: string;
  description?: string;
  indexable?: boolean;
}

// Updates the browser-tab title, meta description and robots tag when a page is shown
// during client-side navigation. The static versions written into each generated route shell
// are what search engines and link previews see first (ADR-0006, ADR-0012 §6).
export function PageMeta({ path, title, description, indexable }: PageMetaProps) {
  const route = path ? findRoute(path) : undefined;
  const finalTitle = title ?? route?.title;
  const finalDescription = description ?? route?.description;
  const finalIndexable = indexable ?? route?.indexable ?? false;

  useEffect(() => {
    if (finalTitle) document.title = finalTitle;
    if (finalDescription) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", finalDescription);
    }
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", finalIndexable ? "index, follow" : "noindex, follow");
  }, [finalTitle, finalDescription, finalIndexable]);

  return null;
}
