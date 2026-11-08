// Status, citations and references (ADR-0003, ADR-0010, ADR-0011).

export interface ContentStatus {
  writing: "not-started" | "in-progress" | "draft-complete";
  /** `cross-checked` = sources actually compared. `fact-checked` needs a human reviewer. */
  accuracy: "unchecked" | "cross-checked" | "fact-checked";
  /** `clinically-reviewed` needs a qualified reviewer. */
  clinical: "none" | "drafted" | "clinically-reviewed" | "not-applicable";
  diagram: "none" | "linked" | "complete" | "not-applicable";
}

export interface Review {
  dimension: "accuracy" | "clinical";
  by: string;
  date: string; // ISO date
}

export interface ContentMeta {
  status: ContentStatus;
  /** Optional fields that genuinely do not apply to this entity (field state "not applicable"). */
  notApplicable?: string[];
  reviews?: Review[];
  /** ISO date of the last content change. */
  updated: string;
}

export interface Citation {
  /** → a ReferenceRecord id. */
  refId: string;
  /** Chapter or section. Never a page number unless verified (ADR-0011). */
  locator?: string;
  /** `false` until a human has checked the source. `true` is rejected until a reviewer exists. */
  locatorVerified: boolean;
  /** The field this citation supports, e.g. "innervation". */
  supports?: string;
}

export interface ReferenceRecord {
  id: string; // "ref.…"
  kind: "textbook" | "article" | "guideline" | "terminology";
  title: string;
  authors?: string[];
  edition?: string;
  publisher?: string;
  year?: number;
  isbn?: string;
  doi?: string;
  url?: string;
  /** Fields above that have not yet been confirmed against the actual source. */
  unconfirmed: string[];
}
