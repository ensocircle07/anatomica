// Nerves used by the Milestone 3 seed.
// AI-drafted, sources not yet opened: accuracy "unchecked" (ADR-0011).
// Relation positions describe where the RELATED structure lies relative to the nerve.

import type { Nerve } from "../../../schema/index.ts";
import { aiDraft, textbooks } from "../../_helpers.ts";

export const radialNerve: Nerve = {
  id: "nerve.radial",
  category: "nerve",
  name: "Radial nerve",
  latinName: "Nervus radialis",
  synonyms: [],
  regions: ["upper-limb.axilla", "upper-limb.arm", "upper-limb.cubital-fossa"],
  systems: ["neurology"],
  level: "core",
  summary:
    "The larger terminal branch of the posterior cord of the brachial plexus. It supplies the extensor muscles of the arm and forearm and skin on the posterior limb and dorsum of the hand.",
  modality: "mixed",
  fibres: ["somatic", "sympathetic"],
  roots: { typical: ["C5", "C6", "C7", "C8", "T1"] },
  origin: { from: "plexus-part.brachial.posterior-cord", terminal: true },
  course: [
    {
      key: "axilla",
      through: "space.axilla",
      relations: [
        { structure: "artery.axillary", position: "anterior" },
        { structure: "muscle.subscapularis", position: "posterior" },
      ],
      text: "Descends behind the [[artery.axillary]], on the muscles of the posterior axillary wall.",
    },
    {
      key: "triangular-interval",
      through: "space.triangular-interval",
      relations: [{ structure: "artery.profunda-brachii", position: "accompanies" }],
      text:
        "Leaves the axilla below the lower border of [[muscle.teres-major]] through the [[space.triangular-interval]], between the long head of [[muscle.triceps-brachii]] and the humerus.",
    },
    {
      key: "radial-groove",
      through: "feature.humerus.radial-groove",
      relations: [
        { structure: "artery.profunda-brachii", position: "accompanies" },
        { structure: "muscle.triceps-brachii", position: "superficial", note: "Lateral head; the medial head lies deep." },
      ],
      text: "Spirals inferolaterally in the [[feature.humerus.radial-groove]], directly on the bone.",
    },
    {
      key: "lateral-intermuscular-septum",
      relations: [{ structure: "fascia.arm.lateral-intermuscular-septum", position: "pierces" }],
      text: "Pierces the [[fascia.arm.lateral-intermuscular-septum]] in the distal arm to enter the anterior compartment.",
    },
    {
      key: "anterior-compartment",
      through: "compartment.arm.anterior",
      relations: [
        { structure: "muscle.brachialis", position: "medial" },
        { structure: "muscle.brachioradialis", position: "lateral" },
      ],
      text:
        "Descends between [[muscle.brachialis]] and [[muscle.brachioradialis]] and, anterior to the [[feature.humerus.lateral-epicondyle]], divides into superficial and deep branches.",
    },
  ],
  sensory: {
    territory:
      "Skin of the posterior arm and forearm, and the lateral part of the dorsum of the hand including the first dorsal web space.",
  },
  sections: {
    clinical:
      "Injury in the radial groove ([[condition.humeral-shaft-fracture]]) typically causes wrist drop with sparing of triceps.",
  },
  citations: textbooks(),
  meta: aiDraft("drafted"),
};

export const axillaryNerve: Nerve = {
  id: "nerve.axillary",
  category: "nerve",
  name: "Axillary nerve",
  latinName: "Nervus axillaris",
  synonyms: ["circumflex nerve"],
  regions: ["upper-limb.axilla", "upper-limb.shoulder"],
  systems: ["neurology"],
  level: "core",
  summary:
    "A terminal branch of the posterior cord of the brachial plexus. It passes through the quadrangular space to supply deltoid, teres minor and the skin over the lower deltoid.",
  modality: "mixed",
  fibres: ["somatic", "sympathetic"],
  roots: { typical: ["C5", "C6"] },
  origin: { from: "plexus-part.brachial.posterior-cord", terminal: true },
  course: [
    {
      key: "axilla",
      through: "space.axilla",
      relations: [
        { structure: "artery.axillary", position: "anterior" },
        { structure: "muscle.subscapularis", position: "posterior" },
      ],
      text: "Passes behind the [[artery.axillary]] and in front of [[muscle.subscapularis]].",
    },
    {
      key: "quadrangular-space",
      through: "space.quadrangular-space",
      relations: [{ structure: "artery.posterior-circumflex-humeral", position: "accompanies" }],
      text: "Leaves the axilla through the [[space.quadrangular-space]] with the [[artery.posterior-circumflex-humeral]].",
    },
    {
      key: "surgical-neck",
      relations: [
        { structure: "feature.humerus.surgical-neck", position: "deep" },
        { structure: "muscle.deltoid", position: "superficial" },
      ],
      text:
        "Winds around the [[feature.humerus.surgical-neck]] deep to [[muscle.deltoid]] and divides into anterior and posterior branches.",
    },
  ],
  sensory: { territory: "Skin over the inferior part of deltoid (the 'regimental badge' area)." },
  sections: {},
  citations: textbooks(),
  meta: aiDraft("none"),
};

export const musculocutaneousNerve: Nerve = {
  id: "nerve.musculocutaneous",
  category: "nerve",
  name: "Musculocutaneous nerve",
  latinName: "Nervus musculocutaneus",
  synonyms: [],
  regions: ["upper-limb.axilla", "upper-limb.arm"],
  systems: ["neurology"],
  level: "core",
  summary:
    "A terminal branch of the lateral cord of the brachial plexus. It supplies the muscles of the anterior compartment of the arm and continues as the lateral cutaneous nerve of the forearm.",
  modality: "mixed",
  fibres: ["somatic", "sympathetic"],
  roots: { typical: ["C5", "C6", "C7"] },
  origin: { from: "plexus-part.brachial.lateral-cord", terminal: true },
  course: [
    {
      key: "axilla",
      through: "space.axilla",
      relations: [{ structure: "artery.axillary", position: "medial" }],
      text: "Leaves the lateral cord in the axilla, lateral to the [[artery.axillary]].",
    },
    {
      key: "coracobrachialis",
      relations: [{ structure: "muscle.coracobrachialis", position: "pierces" }],
      text: "Usually pierces [[muscle.coracobrachialis]].",
    },
    {
      key: "arm",
      through: "compartment.arm.anterior",
      relations: [
        { structure: "muscle.biceps-brachii", position: "superficial" },
        { structure: "muscle.brachialis", position: "deep" },
      ],
      text:
        "Descends between [[muscle.biceps-brachii]] and [[muscle.brachialis]], and emerges lateral to the biceps tendon above the elbow as the lateral cutaneous nerve of the forearm.",
    },
  ],
  sensory: { territory: "Skin of the lateral forearm, via the lateral cutaneous nerve of the forearm." },
  sections: {},
  citations: textbooks(),
  meta: aiDraft("none"),
};

export const nerveRecords = [radialNerve, axillaryNerve, musculocutaneousNerve];
