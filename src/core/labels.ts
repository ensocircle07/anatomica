// Display labels and ordering. Pure logic: no React, no DOM (ADR-0005).

import type { Category } from "../content/schema/index.ts";

/** Singular and plural labels, in the order categories are listed on hub pages. */
export const categoryLabels: [Category, string, string][] = [
  ["bone", "Bone", "Bones"],
  ["bone-feature", "Bone feature", "Bone features"],
  ["cartilage", "Cartilage", "Cartilages"],
  ["joint", "Joint", "Joints"],
  ["ligament", "Ligament", "Ligaments"],
  ["bursa", "Bursa", "Bursae"],
  ["muscle", "Muscle", "Muscles"],
  ["tendon", "Tendon", "Tendons"],
  ["fascia", "Fascia", "Fasciae"],
  ["retinaculum", "Retinaculum", "Retinacula"],
  ["compartment", "Compartment", "Compartments"],
  ["plexus", "Plexus", "Plexuses"],
  ["plexus-part", "Plexus part", "Plexus parts"],
  ["nerve", "Nerve", "Nerves"],
  ["ganglion", "Ganglion", "Ganglia"],
  ["dermatome", "Dermatome", "Dermatomes"],
  ["myotome", "Myotome", "Myotomes"],
  ["artery", "Artery", "Arteries"],
  ["vein", "Vein", "Veins"],
  ["lymph-vessel", "Lymph vessel", "Lymph vessels"],
  ["lymph-node-group", "Lymph node group", "Lymph node groups"],
  ["organ", "Organ", "Organs"],
  ["organ-part", "Organ part", "Organ parts"],
  ["peritoneal-structure", "Peritoneal structure", "Peritoneal structures"],
  ["region", "Region", "Regions"],
  ["space", "Space", "Spaces"],
  ["landmark", "Landmark", "Landmarks"],
  ["condition", "Clinical condition", "Clinical conditions"],
  ["exam-test", "Examination test", "Examination tests"],
  ["procedure", "Procedure", "Procedures"],
];

const singular = new Map(categoryLabels.map(([c, s]) => [c, s]));
const plural = new Map(categoryLabels.map(([c, , p]) => [c, p]));
const order = new Map(categoryLabels.map(([c], i) => [c, i]));

export function categoryLabel(category: Category, count = 1): string {
  return (count === 1 ? singular.get(category) : plural.get(category)) ?? category;
}

export function categoryOrder(category: Category): number {
  return order.get(category) ?? 999;
}

/** "medial-rotation" → "Medial rotation"; "radial-groove" → "Radial groove". */
export function humanise(key: string): string {
  const text = key.replaceAll("-", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "C6, C7, C8 (mainly C7)". */
export function formatRoots(roots: { typical: string[]; predominant?: string[] }): string {
  const base = roots.typical.join(", ");
  return roots.predominant?.length ? `${base} (mainly ${roots.predominant.join(", ")})` : base;
}
