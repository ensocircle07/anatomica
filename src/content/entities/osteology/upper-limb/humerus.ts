// The humerus and the features used by the Milestone 3 seed.
// AI-drafted, sources not yet opened: accuracy "unchecked" (ADR-0011).

import type { Bone, BoneFeature } from "../../../schema/index.ts";
import { aiDraft, textbooks } from "../../_helpers.ts";

export const humerus: Bone = {
  id: "bone.humerus",
  category: "bone",
  name: "Humerus",
  latinName: "Humerus",
  synonyms: [],
  regions: ["upper-limb.shoulder", "upper-limb.arm"],
  systems: ["osteology"],
  level: "core",
  summary:
    "The long bone of the arm. Its head articulates with the scapula at the shoulder and its distal end with the radius and ulna at the elbow.",
  classification: "long",
  partsLayout: [
    { key: "proximal-end", name: "Proximal end" },
    { key: "shaft", name: "Shaft" },
    { key: "distal-end", name: "Distal end" },
  ],
  sideIdentification:
    "The head faces medially, superiorly and posteriorly. The intertubercular sulcus faces anteriorly, and the olecranon fossa lies on the posterior surface of the distal end. The medial epicondyle is more prominent than the lateral.",
  ossification: {
    centres: [
      { site: "Shaft (primary centre)", appears: "Embryonic period" },
      { site: "Head" },
      { site: "Greater tubercle" },
      { site: "Lesser tubercle" },
      { site: "Capitulum" },
      { site: "Trochlea" },
      { site: "Medial epicondyle" },
      { site: "Lateral epicondyle" },
    ],
    notes:
      "Ages of appearance and fusion of the secondary centres vary between sources and are not recorded until checked.",
    citations: textbooks("ossification"),
  },
  sections: {
    overview:
      "Features on the shaft record its relations: the [[feature.humerus.radial-groove]] on the posterior surface carries the [[nerve.radial]] and [[artery.profunda-brachii]], and the [[feature.humerus.surgical-neck]] is encircled by the [[nerve.axillary]] and [[artery.posterior-circumflex-humeral]].",
    clinical:
      "Fractures at the surgical neck endanger the axillary nerve; fractures of the shaft endanger the radial nerve (see [[condition.humeral-shaft-fracture]]).",
  },
  citations: textbooks(),
  meta: aiDraft("drafted", ["radiology"]),
};

export const radialGroove: BoneFeature = {
  id: "feature.humerus.radial-groove",
  category: "bone-feature",
  name: "Radial groove",
  latinName: "Sulcus nervi radialis",
  synonyms: ["spiral groove", "groove for radial nerve"],
  regions: ["upper-limb.arm"],
  systems: ["osteology"],
  level: "core",
  summary:
    "A shallow oblique groove on the posterior surface of the humeral shaft, running inferolaterally. It lodges the radial nerve and the profunda brachii vessels.",
  bone: "bone.humerus",
  part: "shaft",
  kind: "groove",
  palpability: "not-palpable",
  sections: {
    relations:
      "The groove separates the origin of the lateral head of [[muscle.triceps-brachii]] (above) from that of the medial head (below).",
    clinical:
      "Because the nerve lies against bone here, it is at risk in fractures of the shaft ([[condition.humeral-shaft-fracture]]).",
  },
  citations: textbooks(),
  meta: aiDraft("drafted"),
};

export const surgicalNeck: BoneFeature = {
  id: "feature.humerus.surgical-neck",
  category: "bone-feature",
  name: "Surgical neck of humerus",
  latinName: "Collum chirurgicum humeri",
  synonyms: [],
  regions: ["upper-limb.shoulder", "upper-limb.arm"],
  systems: ["osteology"],
  level: "core",
  summary:
    "The narrowing of the humerus just distal to the tubercles, where the proximal end joins the shaft. It is a common fracture site.",
  bone: "bone.humerus",
  part: "proximal-end",
  kind: "neck",
  palpability: "not-palpable",
  sections: {
    relations:
      "The [[nerve.axillary]] and [[artery.posterior-circumflex-humeral]] wind around its posterior and lateral aspect after leaving the [[space.quadrangular-space]], which it bounds laterally.",
    clinical: "Fractures here endanger the axillary nerve and the posterior circumflex humeral vessels.",
  },
  citations: textbooks(),
  meta: aiDraft("drafted"),
};

export const posteriorSurface: BoneFeature = {
  id: "feature.humerus.posterior-surface",
  category: "bone-feature",
  name: "Posterior surface of humerus",
  latinName: "Facies posterior humeri",
  synonyms: [],
  regions: ["upper-limb.arm"],
  systems: ["osteology"],
  level: "core",
  summary:
    "The posterior surface of the humeral shaft. It is crossed obliquely by the radial groove and gives origin to the lateral and medial heads of triceps brachii.",
  bone: "bone.humerus",
  part: "shaft",
  kind: "surface",
  sections: {},
  citations: textbooks(),
  meta: aiDraft("not-applicable", ["palpability"]),
};

export const humerusRecords = [humerus, radialGroove, surgicalNeck, posteriorSurface];
