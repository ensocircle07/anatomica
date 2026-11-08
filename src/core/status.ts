// Computed content status (ADR-0003). Pure logic: no React, no DOM (ADR-0005).

import type { ContentMeta } from "../content/schema/index.ts";

/** "Complete" is never stored: it is true only when every dimension is at its final value or not applicable. */
export function isComplete(meta: ContentMeta): boolean {
  const s = meta.status;
  return (
    s.writing === "draft-complete" &&
    s.accuracy === "fact-checked" &&
    (s.clinical === "clinically-reviewed" || s.clinical === "not-applicable") &&
    (s.diagram === "complete" || s.diagram === "not-applicable")
  );
}

/** Short label for the status badge every page shows (ARCHITECTURE §14). */
export function statusBadge(meta: ContentMeta): string {
  if (isComplete(meta)) return "Complete";
  if (meta.status.writing === "not-started") return "Not yet written";
  if (meta.status.accuracy === "fact-checked") return "Fact-checked — clinical review pending";
  return "Draft — not yet expert-reviewed";
}

/**
 * Whether an entity page may be indexed by search engines (ADR-0012 §6): only written records whose
 * accuracy is above "unchecked". Computed from status, never stored.
 */
export function isIndexable(entity: { meta: ContentMeta; stub?: true }): boolean {
  return entity.stub !== true && entity.meta.status.accuracy !== "unchecked";
}
