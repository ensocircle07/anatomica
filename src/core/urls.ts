// URLs derived from stable IDs (ADR-0012 §1). Pure logic: no React, no DOM (ADR-0005).

import { categoryPrefixes, type Category, type EntityId } from "../content/schema/index.ts";

/** URL section for every category. A Record, so a new category without a section is a compile error. */
export const categorySections: Record<Category, string> = {
  bone: "bones",
  "bone-feature": "bones", // feature.humerus.radial-groove → /bones/humerus/radial-groove
  cartilage: "cartilages",
  joint: "joints",
  ligament: "ligaments",
  bursa: "bursae",
  muscle: "muscles",
  tendon: "tendons",
  fascia: "fasciae",
  retinaculum: "retinacula",
  nerve: "nerves",
  plexus: "plexuses",
  "plexus-part": "plexuses", // plexus-part.brachial.posterior-cord → /plexuses/brachial/posterior-cord
  ganglion: "ganglia",
  dermatome: "dermatomes",
  myotome: "myotomes",
  artery: "arteries",
  vein: "veins",
  "lymph-vessel": "lymph-vessels",
  "lymph-node-group": "lymph-nodes",
  organ: "organs",
  "organ-part": "organs", // organ-part.stomach.fundus → /organs/stomach/fundus
  "peritoneal-structure": "peritoneum",
  region: "region-entities",
  space: "spaces",
  compartment: "compartments",
  landmark: "landmarks",
  condition: "clinical",
  "exam-test": "clinical/examination",
  procedure: "clinical/procedures",
};

/** "/nerves/radial" for { id: "nerve.radial", category: "nerve" }. */
export function entityPath(entity: { id: EntityId; category: Category }): string {
  const prefix = categoryPrefixes[entity.category];
  if (!entity.id.startsWith(prefix + ".")) {
    throw new Error(`${entity.id} does not start with "${prefix}."`);
  }
  const rest = entity.id.slice(prefix.length + 1).split(".");
  return `/${categorySections[entity.category]}/${rest.join("/")}`;
}

/** "/regions/upper-limb/arm" for "upper-limb.arm". */
export function regionPath(regionId: string): string {
  return `/regions/${regionId.split(".").join("/")}`;
}

export function systemPath(systemId: string): string {
  return `/systems/${systemId}`;
}
