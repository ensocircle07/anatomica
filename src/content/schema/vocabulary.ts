// Shared vocabularies for the content schema (ADR-0011).
// Pure data and types: no React, no DOM (ADR-0005).

/** Stable, readable, never-renamed identifier, e.g. "nerve.radial" (ARCHITECTURE §4). */
export type EntityId = string;

/** Markdown subset. Graph links are written [[entity.id]] and are checked by the validator. */
export type Prose = string;

export type Level = "core" | "advanced" | "specialist";

export type Frequency = "common" | "uncommon" | "rare" | "uncertain";

/** Every entity category, and the prefix its IDs must start with. */
export const categoryPrefixes = {
  // Skeletal
  bone: "bone",
  "bone-feature": "feature",
  cartilage: "cartilage",
  // Joints
  joint: "joint",
  ligament: "ligament",
  bursa: "bursa",
  // Muscular
  muscle: "muscle",
  tendon: "tendon",
  fascia: "fascia",
  retinaculum: "retinaculum",
  // Nervous
  nerve: "nerve",
  plexus: "plexus",
  "plexus-part": "plexus-part",
  ganglion: "ganglion",
  dermatome: "dermatome",
  myotome: "myotome",
  // Vascular
  artery: "artery",
  vein: "vein",
  "lymph-vessel": "lymph-vessel",
  "lymph-node-group": "lymph-node-group",
  // Visceral
  organ: "organ",
  "organ-part": "organ-part",
  "peritoneal-structure": "peritoneal-structure",
  // Topographical
  region: "region",
  space: "space",
  compartment: "compartment", // ADR-0011 D5
  landmark: "landmark",
  // Clinical
  condition: "condition",
  "exam-test": "exam-test",
  procedure: "procedure",
} as const;

export type Category = keyof typeof categoryPrefixes;

export const segments = [
  "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
  "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12",
  "L1", "L2", "L3", "L4", "L5",
  "S1", "S2", "S3", "S4", "S5",
  "Co1",
] as const;

/** Spinal cord segment / root. Array order is cranial → caudal. */
export type Segment = (typeof segments)[number];

export const movements = [
  // general (limb joints, including the digits' MCP and IP joints)
  "flexion", "extension", "abduction", "adduction",
  "medial-rotation", "lateral-rotation", "circumduction",
  // forearm and wrist
  "pronation", "supination", "radial-deviation", "ulnar-deviation",
  // scapula
  "elevation", "depression", "protraction", "retraction",
  "upward-rotation", "downward-rotation",
  // thumb
  "opposition", "reposition",
  // axial
  "lateral-flexion", "rotation",
  // ankle and foot
  "dorsiflexion", "plantarflexion", "inversion", "eversion",
] as const;

export type Movement = (typeof movements)[number];

/** Position of a related structure relative to the entity being described. */
export type Position =
  | "anterior" | "posterior" | "medial" | "lateral" | "superior" | "inferior"
  | "superficial" | "deep" | "accompanies" | "crosses-anterior" | "crosses-posterior"
  | "pierces" | "within";
