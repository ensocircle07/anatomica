// Arteries used by the Milestone 3 seed.
// AI-drafted, sources not yet opened: accuracy "unchecked" (ADR-0011).

import type { Artery } from "../../../schema/index.ts";
import { aiDraft, textbooks } from "../../_helpers.ts";

export const profundaBrachii: Artery = {
  id: "artery.profunda-brachii",
  category: "artery",
  name: "Profunda brachii artery",
  latinName: "Arteria profunda brachii",
  synonyms: ["deep artery of arm", "deep brachial artery"],
  regions: ["upper-limb.arm"],
  systems: ["angiology"],
  level: "core",
  summary:
    "The largest branch of the brachial artery. It accompanies the radial nerve around the back of the humerus and supplies the posterior compartment of the arm.",
  origin: { from: "artery.brachial", note: "Arises near its origin, below the lower border of teres major." },
  course: [
    {
      key: "triangular-interval",
      through: "space.triangular-interval",
      relations: [{ structure: "nerve.radial", position: "accompanies" }],
      text: "Passes posteriorly with the [[nerve.radial]] through the [[space.triangular-interval]].",
    },
    {
      key: "radial-groove",
      through: "feature.humerus.radial-groove",
      relations: [{ structure: "nerve.radial", position: "accompanies" }],
      text:
        "Runs in the [[feature.humerus.radial-groove]] and ends by dividing into the middle and radial collateral arteries, which join the anastomosis around the elbow.",
    },
  ],
  territory: "Posterior compartment of the arm, chiefly [[muscle.triceps-brachii]].",
  anastomoses: [
    {
      with: ["artery.posterior-circumflex-humeral"],
      clinical: "One of the collateral routes around the shoulder and proximal arm.",
    },
  ],
  sections: {},
  citations: textbooks(),
  meta: aiDraft("none"),
};

export const posteriorCircumflexHumeral: Artery = {
  id: "artery.posterior-circumflex-humeral",
  category: "artery",
  name: "Posterior circumflex humeral artery",
  latinName: "Arteria circumflexa humeri posterior",
  synonyms: [],
  regions: ["upper-limb.axilla", "upper-limb.shoulder"],
  systems: ["angiology"],
  level: "core",
  summary:
    "A branch of the axillary artery that passes through the quadrangular space with the axillary nerve and winds around the surgical neck of the humerus.",
  origin: { from: "artery.axillary", note: "From the third part of the axillary artery." },
  course: [
    {
      key: "quadrangular-space",
      through: "space.quadrangular-space",
      relations: [{ structure: "nerve.axillary", position: "accompanies" }],
      text: "Passes posteriorly through the [[space.quadrangular-space]] with the [[nerve.axillary]].",
    },
    {
      key: "surgical-neck",
      relations: [{ structure: "feature.humerus.surgical-neck", position: "deep" }],
      text: "Winds around the [[feature.humerus.surgical-neck]] deep to deltoid.",
    },
  ],
  territory: "Deltoid, the glenohumeral joint and the long and lateral heads of [[muscle.triceps-brachii]].",
  anastomoses: [{ with: ["artery.anterior-circumflex-humeral"] }],
  sections: {},
  citations: textbooks(),
  meta: aiDraft("none"),
};

export const arteryRecords = [profundaBrachii, posteriorCircumflexHumeral];
