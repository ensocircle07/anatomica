// Clinical condition used by the Milestone 3 seed.
// AI-drafted: accuracy "unchecked", clinical "drafted" (ADR-0010, ADR-0011).

import type { Condition } from "../../schema/index.ts";
import { aiDraft, textbooks } from "../../entities/_helpers.ts";

export const humeralShaftFracture: Condition = {
  id: "condition.humeral-shaft-fracture",
  category: "condition",
  name: "Fracture of the humeral shaft",
  synonyms: ["humeral shaft fracture", "midshaft humerus fracture"],
  regions: ["upper-limb.arm"],
  systems: ["clinical", "osteology"],
  level: "core",
  summary:
    "A fracture of the body of the humerus. Its key anatomical risk is injury to the radial nerve, which lies directly on the bone in the radial groove.",
  kind: "fracture",
  involves: [
    { structure: "bone.humerus", role: "injured" },
    { structure: "nerve.radial", role: "endangered" },
    { structure: "artery.profunda-brachii", role: "endangered" },
  ],
  mechanism:
    "The [[nerve.radial]] and [[artery.profunda-brachii]] run in the [[feature.humerus.radial-groove]] in direct contact with the posterior shaft. Displaced fragments can stretch, contuse or trap the nerve. The branches to the long and medial heads of [[muscle.triceps-brachii]] usually arise before the nerve enters the groove, so elbow extension is typically preserved.",
  presentation:
    "Pain, swelling and abnormal movement of the arm. With radial nerve involvement: wrist drop, inability to extend the fingers at the metacarpophalangeal joints, and reduced sensation over the dorsum of the hand around the first web space.",
  signs: ["wrist drop"],
  complications: [
    {
      text: "Radial nerve palsy. Reported rates vary; a figure is not recorded until checked against sources.",
      frequency: "uncertain",
      citations: textbooks("complications"),
    },
  ],
  sections: {},
  citations: textbooks(),
  meta: aiDraft("drafted"),
};

export const conditionRecords = [humeralShaftFracture];
