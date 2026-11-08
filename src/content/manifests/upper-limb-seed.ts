// Manifests: structures that SHOULD exist, so completeness is measured against them (ARCHITECTURE §14).
//
// This is the Milestone 3 SEED manifest: a small hand-picked list around the seed records.
// It is NOT yet derived from Terminologia Anatomica 2; the full upper-limb manifest is built in Milestone 6.

import type { Category, EntityId } from "../schema/index.ts";

export interface ManifestGroup {
  id: string;
  title: string;
  category: Category;
  expected: EntityId[];
}

export interface Manifest {
  id: string;
  title: string;
  note: string;
  groups: ManifestGroup[];
}

export const upperLimbSeedManifest: Manifest = {
  id: "manifest.upper-limb.seed",
  title: "Upper limb — Milestone 3 seed",
  note: "Hand-picked around the seed records; not yet a TA2-derived list.",
  groups: [
    {
      id: "arm-muscles",
      title: "Arm — muscles",
      category: "muscle",
      expected: ["muscle.biceps-brachii", "muscle.coracobrachialis", "muscle.brachialis", "muscle.triceps-brachii"],
    },
    {
      id: "arm-compartments",
      title: "Arm — compartments",
      category: "compartment",
      expected: ["compartment.arm.anterior", "compartment.arm.posterior"],
    },
    {
      id: "nerves",
      title: "Axilla and arm — nerves",
      category: "nerve",
      expected: ["nerve.musculocutaneous", "nerve.axillary", "nerve.radial", "nerve.median", "nerve.ulnar"],
    },
    {
      id: "arteries",
      title: "Axilla and arm — arteries",
      category: "artery",
      expected: [
        "artery.axillary", "artery.brachial", "artery.profunda-brachii",
        "artery.posterior-circumflex-humeral", "artery.anterior-circumflex-humeral", "artery.superior-ulnar-collateral",
      ],
    },
    {
      id: "humerus",
      title: "Humerus — bone and features",
      category: "bone-feature",
      expected: [
        "bone.humerus", "feature.humerus.surgical-neck", "feature.humerus.radial-groove",
        "feature.humerus.posterior-surface", "feature.humerus.anteromedial-surface",
        "feature.humerus.anterolateral-surface", "feature.humerus.lateral-epicondyle",
      ],
    },
    {
      id: "spaces",
      title: "Spaces",
      category: "space",
      expected: ["space.axilla", "space.quadrangular-space", "space.triangular-interval"],
    },
  ],
};

export const manifests: Manifest[] = [upperLimbSeedManifest];
