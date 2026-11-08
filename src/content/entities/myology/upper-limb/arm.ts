// Muscles and compartments of the arm used by the Milestone 3 seed.
// AI-drafted, sources not yet opened: accuracy "unchecked" (ADR-0011).

import type { Compartment, Muscle } from "../../../schema/index.ts";
import { aiDraft, textbooks } from "../../_helpers.ts";

export const posteriorCompartmentOfArm: Compartment = {
  id: "compartment.arm.posterior",
  category: "compartment",
  name: "Posterior compartment of arm",
  synonyms: ["extensor compartment of arm"],
  regions: ["upper-limb.arm"],
  systems: ["topography", "myology"],
  level: "core",
  summary:
    "The fascial compartment behind the humerus and the medial and lateral intermuscular septa. It contains triceps brachii and is supplied by the radial nerve.",
  boundaries:
    "Anteriorly the humerus and the [[fascia.arm.medial-intermuscular-septum]] and [[fascia.arm.lateral-intermuscular-septum]]; posteriorly the deep fascia of the arm.",
  sections: {},
  citations: textbooks(),
  meta: aiDraft("not-applicable"),
};

export const tricepsBrachii: Muscle = {
  id: "muscle.triceps-brachii",
  category: "muscle",
  name: "Triceps brachii",
  latinName: "Musculus triceps brachii",
  synonyms: ["triceps"],
  regions: ["upper-limb.arm"],
  systems: ["myology"],
  level: "core",
  summary:
    "The three-headed muscle of the posterior compartment of the arm. It is the main extensor of the elbow; its long head also acts on the shoulder.",
  compartment: "compartment.arm.posterior",
  depth: "superficial",
  heads: [
    {
      key: "long",
      name: "Long head",
      origin: [{ site: "feature.scapula.infraglenoid-tubercle" }],
    },
    {
      key: "lateral",
      name: "Lateral head",
      origin: [{ site: "feature.humerus.posterior-surface", detail: "Superior to the radial groove." }],
    },
    {
      key: "medial",
      name: "Medial head",
      origin: [
        { site: "feature.humerus.posterior-surface", detail: "Inferior to the radial groove." },
        { site: "fascia.arm.medial-intermuscular-septum" },
        { site: "fascia.arm.lateral-intermuscular-septum" },
      ],
    },
  ],
  origin: [],
  insertion: [{ site: "feature.ulna.olecranon", detail: "Posterior part of its superior surface." }],
  innervation: [
    {
      nerve: "nerve.radial",
      roots: { typical: ["C6", "C7", "C8"], predominant: ["C7"] },
      contribution: "main",
      arisesIn: "axilla",
      heads: ["long", "medial"],
      note: "Branches to the long head and part of the medial head arise before the nerve enters the radial groove.",
    },
    {
      nerve: "nerve.radial",
      roots: { typical: ["C6", "C7", "C8"], predominant: ["C7"] },
      contribution: "main",
      arisesIn: "radial-groove",
      heads: ["lateral", "medial"],
    },
  ],
  bloodSupply: [
    { artery: "artery.profunda-brachii" },
    { artery: "artery.posterior-circumflex-humeral", heads: ["long", "lateral"] },
    { artery: "artery.superior-ulnar-collateral", heads: ["medial"] },
  ],
  actions: [
    { joint: "joint.elbow", movement: "extension", role: "prime" },
    { joint: "joint.glenohumeral", movement: "extension", role: "secondary", heads: ["long"] },
    { joint: "joint.glenohumeral", movement: "adduction", role: "secondary", heads: ["long"] },
  ],
  palpation:
    "Felt on the back of the arm when the elbow is extended against resistance; the long head is palpable medially, just below the posterior axillary fold.",
  sections: {
    relations:
      "The long head passes between [[muscle.teres-minor]] and [[muscle.teres-major]], forming the medial boundary of the [[space.quadrangular-space]] and the lateral boundary of the triangular space.",
    clinical:
      "Because the branches to the long and medial heads arise proximal to the radial groove, elbow extension is usually preserved after a radial nerve injury in a shaft fracture ([[condition.humeral-shaft-fracture]]).",
  },
  variations: [
    {
      text: "The long head may receive a branch from the [[nerve.axillary]] in some individuals.",
      frequency: "uncertain",
      citations: textbooks("variations"),
    },
  ],
  citations: textbooks(),
  meta: aiDraft("drafted"),
};

export const brachialis: Muscle = {
  id: "muscle.brachialis",
  category: "muscle",
  name: "Brachialis",
  latinName: "Musculus brachialis",
  synonyms: [],
  regions: ["upper-limb.arm"],
  systems: ["myology"],
  level: "core",
  summary:
    "A broad muscle deep to biceps brachii in the anterior compartment of the arm. It flexes the elbow in every position of the forearm.",
  compartment: "compartment.arm.anterior",
  depth: "deep",
  origin: [
    { site: "feature.humerus.anteromedial-surface", detail: "Distal half." },
    { site: "feature.humerus.anterolateral-surface", detail: "Distal half." },
    { site: "fascia.arm.medial-intermuscular-septum" },
    { site: "fascia.arm.lateral-intermuscular-septum" },
  ],
  insertion: [{ site: "feature.ulna.coronoid-process" }, { site: "feature.ulna.tuberosity" }],
  innervation: [
    {
      nerve: "nerve.musculocutaneous",
      roots: { typical: ["C5", "C6"] },
      contribution: "main",
      arisesIn: "arm",
    },
    {
      nerve: "nerve.radial",
      // Root value of this small branch is not recorded until checked against sources.
      contribution: "minor",
      arisesIn: "anterior-compartment",
      note: "Supplies a lateral part of the muscle. The size of this contribution varies between individuals.",
    },
  ],
  bloodSupply: [{ artery: "artery.brachial" }],
  actions: [{ joint: "joint.elbow", movement: "flexion", role: "prime" }],
  sections: {
    relations: "Lies deep to [[muscle.biceps-brachii]]; the [[nerve.musculocutaneous]] runs between the two.",
  },
  citations: textbooks(),
  meta: aiDraft("none"),
};

export const armMuscleRecords = [posteriorCompartmentOfArm, tricepsBrachii, brachialis];
