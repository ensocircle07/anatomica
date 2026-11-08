// Reference records (ARCHITECTURE §14).
// Bibliographic details listed in `unconfirmed` have NOT yet been checked against the actual
// book or source and must be confirmed by a human before they are relied on. No ISBNs or page
// numbers are recorded until they have been checked.

import type { ReferenceRecord } from "../schema/index.ts";

export const references: ReferenceRecord[] = [
  {
    id: "ref.ta2",
    kind: "terminology",
    title: "Terminologia Anatomica, 2nd edition (TA2)",
    authors: ["Federative International Programme for Anatomical Terminology (FIPAT)"],
    edition: "2nd",
    unconfirmed: ["year", "url"],
  },
  {
    id: "ref.grays-anatomy",
    kind: "textbook",
    title: "Gray's Anatomy: The Anatomical Basis of Clinical Practice",
    authors: ["Standring S (editor-in-chief)"],
    edition: "42nd",
    publisher: "Elsevier",
    unconfirmed: ["edition", "year", "isbn"],
  },
  {
    id: "ref.moore-clinically-oriented-anatomy",
    kind: "textbook",
    title: "Clinically Oriented Anatomy",
    authors: ["Moore KL", "Dalley AF", "Agur AMR"],
    edition: "9th",
    publisher: "Wolters Kluwer",
    unconfirmed: ["edition", "year", "isbn"],
  },
];
