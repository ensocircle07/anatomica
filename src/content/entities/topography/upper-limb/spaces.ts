// Spaces used by the Milestone 3 seed.
// AI-drafted, sources not yet opened: accuracy "unchecked" (ADR-0011).
// Contents are NOT stored here: they are derived from the `through` of each nerve and vessel (ADR-0011 D3).

import type { Space } from "../../../schema/index.ts";
import { aiDraft, textbooks } from "../../_helpers.ts";

export const quadrangularSpace: Space = {
  id: "space.quadrangular-space",
  category: "space",
  name: "Quadrangular space",
  synonyms: ["quadrilateral space"],
  regions: ["upper-limb.shoulder", "upper-limb.axilla"],
  systems: ["topography"],
  level: "core",
  summary:
    "A four-sided gap in the posterior wall of the axilla through which the axillary nerve and posterior circumflex humeral vessels reach the back of the shoulder.",
  boundaries: [
    { side: "superior", formedBy: ["muscle.teres-minor"], note: "Viewed from in front, subscapularis forms this border." },
    { side: "inferior", formedBy: ["muscle.teres-major"] },
    { side: "medial", formedBy: ["muscle.triceps-brachii"], note: "Long head." },
    { side: "lateral", formedBy: ["feature.humerus.surgical-neck"] },
  ],
  communications: [{ space: "space.axilla", via: "Its anterior opening lies in the posterior wall of the axilla." }],
  sections: {
    clinical:
      "The axillary nerve can be compressed here (quadrilateral space syndrome), and is endangered in fractures of the [[feature.humerus.surgical-neck]].",
  },
  citations: textbooks(),
  meta: aiDraft("drafted"),
};

export const spaceRecords = [quadrangularSpace];
