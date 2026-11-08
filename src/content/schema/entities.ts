// Entity types (ARCHITECTURE §4–6 as refined by ADR-0011).
// Fields marked GENERATED are never stored: the graph builder derives them.

import type { Citation, ContentMeta } from "./meta.ts";
import type { RegionId, SystemId } from "../taxonomy/index.ts";
import type { Category, EntityId, Frequency, Level, Movement, Position, Prose, Segment } from "./vocabulary.ts";

export type SectionKey = "overview" | "relations" | "development" | "surface" | "clinical";

export interface Variation {
  text: Prose;
  frequency: Frequency;
  citations: Citation[];
}

export interface BaseEntity {
  id: EntityId;
  category: Category;
  /** British English canonical name (ADR-0008). */
  name: string;
  latinName?: string;
  /** TA2 identifier. Left empty until checked against TA2 (ADR-0011). */
  taId?: string;
  synonyms: string[];
  regions: RegionId[];
  systems: SystemId[];
  level: Level;
  /** 1–3 sentences. */
  summary: string;
  sections: Partial<Record<SectionKey, Prose>>;
  variations?: Variation[];
  citations: Citation[];
  meta: ContentMeta;
  // GENERATED: clinical significance (from Condition.involves), diagrams (from hotspots)
}

/** A referenced structure that is not written yet (ADR-0011 D1). */
export interface StubEntity {
  id: EntityId;
  category: Category;
  name: string;
  regions: RegionId[];
  systems: SystemId[];
  stub: true;
  meta: ContentMeta;
}

// ── Shared pieces ───────────────────────────────────

export interface RootValue {
  typical: Segment[];
  predominant?: Segment[];
  sourcesDisagree?: { note: Prose; citations: Citation[] };
}

/** One ordered step of a nerve's or vessel's course (ADR-0011 amendment A). */
export interface CourseSegment {
  /** Stable key, unique within the course, e.g. "radial-groove". Array order is proximal → distal. */
  key: string;
  /** The single stored "passes through" fact (space, compartment, bone feature…). */
  through?: EntityId;
  relations: { structure: EntityId; position: Position; note?: Prose }[];
  text: Prose;
}

/** Where a nerve or vessel comes from. Storing this is the "branch of" edge (ADR-0011 D2). */
export interface ConduitOrigin {
  from: EntityId;
  /** Key of the parent's course segment where this branch arises. */
  segment?: string;
  /** True if this is one of the parent's terminal branches. */
  terminal?: boolean;
  note?: Prose;
}

/** Shared shape of nerves, arteries and veins: an ordered course (ADR-0011 amendment A). */
export interface Conduit {
  course: CourseSegment[];
}

// ── Skeletal ────────────────────────────────────────

export interface Bone extends BaseEntity {
  category: "bone";
  classification: "long" | "short" | "flat" | "irregular" | "sesamoid" | "pneumatic";
  /** Ordered parts used to group features, e.g. proximal end, shaft, distal end. */
  partsLayout: { key: string; name: string }[];
  sideIdentification?: Prose;
  ossification?: {
    centres: { site: string; appears?: string; fuses?: string }[];
    notes?: Prose;
    citations: Citation[];
  };
  radiology?: Prose;
  // GENERATED: features, attachments, articulations
}

export interface BoneFeature extends BaseEntity {
  category: "bone-feature";
  /** The only stored link between a feature and its bone. Must be a full bone. */
  bone: EntityId;
  /** A key from the bone's partsLayout. */
  part: string;
  kind:
    | "process" | "tubercle" | "tuberosity" | "spine" | "condyle" | "epicondyle" | "head" | "neck"
    | "fossa" | "groove" | "notch" | "foramen" | "canal" | "facet" | "surface" | "border"
    | "angle" | "line" | "crest";
  palpability?: "reliably-palpable" | "variably-palpable" | "not-palpable";
  // GENERATED: attachments, transmits
}

// ── Muscular ────────────────────────────────────────

export interface Attachment {
  site: EntityId;
  detail?: Prose;
}

export interface Innervation {
  /** Must be a full nerve record. */
  nerve: EntityId;
  /** Optional: a missing value counts as incomplete. Must be a subset of the nerve's roots. */
  roots?: RootValue;
  contribution: "main" | "minor" | "variable";
  /** Course segment key on `nerve` where this branch arises. */
  arisesIn?: string;
  /** Head keys this supply applies to; omitted = whole muscle. */
  heads?: string[];
  note?: Prose;
}

export interface Muscle extends BaseEntity {
  category: "muscle";
  compartment?: EntityId;
  depth: "superficial" | "intermediate" | "deep";
  layer?: string;
  /** When present, `origin` must be empty and each head carries its own origin. */
  heads?: { key: string; name: string; origin: Attachment[] }[];
  origin: Attachment[];
  insertion: Attachment[];
  innervation: Innervation[];
  bloodSupply: { artery: EntityId; heads?: string[] }[];
  actions: { joint: EntityId; movement: Movement; role: "prime" | "secondary" | "stabiliser"; heads?: string[] }[];
  palpation?: Prose;
  // GENERATED: synergists, antagonists
}

// ── Nervous and vascular ────────────────────────────

export interface Nerve extends BaseEntity, Conduit {
  category: "nerve";
  origin: ConduitOrigin;
  modality: "motor" | "sensory" | "mixed";
  fibres?: ("somatic" | "sympathetic" | "parasympathetic" | "visceral-afferent")[];
  roots: RootValue;
  sensory?: { territory: Prose };
  // GENERATED: branches by segment, terminal branches, muscles supplied, passes through,
  //            clinical significance, deficits by lesion level
}

export interface Artery extends BaseEntity, Conduit {
  category: "artery";
  origin: ConduitOrigin;
  continuesAs?: EntityId;
  territory: Prose;
  anastomoses: { with: EntityId[]; name?: string; clinical?: Prose }[];
  pulsePoint?: EntityId;
  // GENERATED: branches, structures supplied, passes through
}

export interface Vein extends BaseEntity, Conduit {
  category: "vein";
  system: "superficial" | "deep" | "perforator" | "sinus" | "portal";
  /** The "tributary of" edge, stored on the tributary. `segment` = key on the receiving vein's course. */
  drainsInto: { into: EntityId; segment?: string; note?: Prose };
  valves?: Prose;
  communications?: { with: EntityId; via?: string; portosystemic?: boolean }[];
}

// ── Topographical ───────────────────────────────────

export interface Space extends BaseEntity {
  category: "space";
  boundaries: {
    side: "roof" | "floor" | "apex" | "base" | "anterior" | "posterior"
        | "medial" | "lateral" | "superior" | "inferior";
    formedBy: EntityId[];
    note?: Prose;
  }[];
  /** Display order only; must be a permutation of the generated contents (ADR-0011 D3). */
  contentsOrder?: { axis: string; order: EntityId[] };
  contentsMnemonic?: { text: string; caveat?: string };
  communications: { space: EntityId; via: Prose }[];
  surfaceLandmarks?: EntityId[];
  // GENERATED: contents
}

export interface Compartment extends BaseEntity {
  category: "compartment";
  boundaries?: Prose;
  // GENERATED: muscles, structures passing through
}

// ── Clinical ────────────────────────────────────────

export interface Condition extends BaseEntity {
  category: "condition";
  kind:
    | "fracture" | "dislocation" | "nerve-lesion" | "entrapment" | "vascular" | "visceral"
    | "infection-spread" | "hernia" | "ligament-injury" | "degeneration" | "other";
  involves: {
    structure: EntityId;
    role: "injured" | "endangered" | "compressed" | "denervated" | "ischaemic" | "obstructed" | "route-of-spread";
  }[];
  /** REQUIRED: the anatomical reasoning. */
  mechanism: Prose;
  presentation: Prose;
  signs?: string[];
  examination?: EntityId[];
  investigations?: Prose;
  complications?: { text: Prose; frequency: Frequency; citations: Citation[] }[];
  /** Needs a citation with `supports: "frequency"`. */
  frequency?: Frequency;
  procedural?: Prose;
}

export type FullEntity = Bone | BoneFeature | Muscle | Nerve | Artery | Vein | Space | Compartment | Condition;

/** Categories that have a full schema. Any other category can only exist as a stub for now. */
export const fullSchemaCategories = [
  "bone", "bone-feature", "muscle", "nerve", "artery", "vein", "space", "compartment", "condition",
] as const satisfies readonly FullEntity["category"][];

export type Entity = FullEntity | StubEntity;

export function isStub(entity: Entity): entity is StubEntity {
  return "stub" in entity && entity.stub === true;
}
