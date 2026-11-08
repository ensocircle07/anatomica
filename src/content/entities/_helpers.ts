// Small helpers for writing entity records. Pure data, no React (ADR-0005).

import type { Citation, ContentMeta, ContentStatus, StubEntity } from "../schema/index.ts";

/** Date of the Milestone 3 seed draft. */
export const SEED_DATE = "2026-11-08";

/**
 * Status for content drafted by the AI assistant without opening the sources:
 * accuracy stays "unchecked" (ADR-0011), diagrams "none" until Milestone 7.
 */
export function aiDraft(clinical: ContentStatus["clinical"], notApplicable?: string[]): ContentMeta {
  return {
    status: { writing: "draft-complete", accuracy: "unchecked", clinical, diagram: "none" },
    ...(notApplicable ? { notApplicable } : {}),
    updated: SEED_DATE,
  };
}

/** A citation with no locator. Page numbers are never invented (ARCHITECTURE §14). */
export function cite(refId: string, supports?: string): Citation {
  return { refId, locatorVerified: false, ...(supports ? { supports } : {}) };
}

/** The standard pair of textbook citations used for the seed draft. */
export function textbooks(supports?: string): Citation[] {
  return [cite("ref.grays-anatomy", supports), cite("ref.moore-clinically-oriented-anatomy", supports)];
}

export function stub(
  id: string,
  category: StubEntity["category"],
  name: string,
  regions: StubEntity["regions"],
  systems: StubEntity["systems"],
): StubEntity {
  return {
    id, category, name, regions, systems, stub: true,
    meta: {
      status: { writing: "not-started", accuracy: "unchecked", clinical: "none", diagram: "none" },
      updated: SEED_DATE,
    },
  };
}
