# ADR-0011: Content schema refinements for Milestone 3

- **Status:** Accepted
- **Date:** 2026-11-08
- **Refines:** [`ARCHITECTURE.md` §4–6](../ARCHITECTURE.md#4-content-data-model), [ADR-0003](0003-multi-dimensional-content-status.md), [ADR-0005](0005-knowledge-graph-and-stack.md)

## Context
Before writing the schema code, the data model in `ARCHITECTURE.md` was checked against the
rule "every relationship is stored on one side only" (ADR-0005) and against the Milestone 3 seed
set. Several fields stored the same fact twice, and the seed set referred to structures that
would not exist yet. The owner approved the proposal on 2026-11-08 with amendments A–D.

From this milestone the TypeScript types in `src/content/schema/` are the authoritative schema.
`ARCHITECTURE.md` §4–6 describes the intent; where they differ, the code and this ADR win.

## Decision

### D1 — Stub entities
A structure that is referenced but not yet written may exist as a **stub**: ID, category, name,
regions, systems, `stub: true` and `meta` (writing status `not-started`). Nothing else.
References to stubs are valid; the coverage report counts them as missing.

**Stubs cannot back detailed claims** (amendment C). A stub may not be the target of a reference
whose correctness depends on the target's own data:

| Field | Why the target must be a full record |
|---|---|
| `Muscle.innervation[].nerve` | root values are checked against the nerve's roots |
| `Muscle.innervation[].arisesIn` | the segment must exist on the nerve's course |
| `origin.from` when `origin.segment` is given (nerves, arteries, veins) | the segment must exist on the parent's course |
| `BoneFeature.bone` | `part` must be a key in the bone's `partsLayout` |

Attachments, actions, blood supply, relations, boundaries and clinical `involves` may point to stubs.

### D2 — Branches are stored on the branch only
`CourseSegment.branchesGiven`, `Nerve.terminatesAs` and `Nerve.sensory.cutaneousBranches` are removed.
A branch stores `origin: { from, segment?, terminal? }`. The parent's branch lists are generated.

### D3 — "Passes through" is stored on the conduit only
`CourseSegment.through` is the single stored fact. `BoneFeature.transmits` and `Space.contents` are
removed and generated. A space may store `contentsOrder` purely to set the display order; it must be
a permutation of the generated contents.

**Amendment A:** nerves, arteries and veins share one **conduit** shape: an ordered `course` of
`CourseSegment`s, each with an optional `through`. Spaces therefore derive nervous, arterial and
venous contents the same way.

### D4 — Clinical links and diagram references are generated
`BaseEntity.clinical` (duplicated `Condition.involves`) and `BaseEntity.diagramRefs` (duplicated
diagram hotspots) are removed. Free-text clinical notes go in `sections.clinical`.

### D5 — Additions
- Category **`compartment`** (topographical group); `Muscle.compartment` points to it.
- `Muscle.heads[]` with their own origins; when present, the muscle's own `origin` is empty.
  `innervation`, `bloodSupply` and `actions` may name the heads they apply to.
- `Muscle.innervation[].arisesIn`: the nerve course segment where the branch arises (for lesion-level reasoning).
- `Muscle.innervation[].contribution`: `main` | `minor` | `variable`. This makes e.g. the radial
  nerve's minor supply to brachialis data, so quiz distractors can be checked against it.
- `Muscle.innervation[].roots` is optional. A missing value counts as incomplete; values are not guessed.
- Complications and variations carry their own `citations`; a frequency other than `uncertain` needs one.

### Status rules for AI-drafted content (ADR-0003, ADR-0010)
- Accuracy above `cross-checked` and clinical above `drafted` require a `reviews` entry.
- `cross-checked` means sources were actually compared. Content the assistant drafts without opening
  the sources stays `unchecked`.
- `clinical` and `diagram` may be `not-applicable`.

### Citations
- `locatorVerified: true` is rejected until a reviewer process exists (ADR-0010).
- An unverified locator may not contain a page number. Page numbers are never invented.
- TA2 identifiers (`taId`) are not filled in until checked against the TA2 source.

### Validator rules added by amendment C
1. Muscle innervation roots (typical and predominant) must be a subset of the nerve's typical roots.
2. `arisesIn` must be a segment key on that nerve's course.
3. `contentsOrder` must be a permutation of the derived contents.
4. Stubs cannot back detailed claims (table above).

### Final unions (amendment D)

```ts
type Segment =
  | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8"
  | "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "T8" | "T9" | "T10" | "T11" | "T12"
  | "L1" | "L2" | "L3" | "L4" | "L5"
  | "S1" | "S2" | "S3" | "S4" | "S5"
  | "Co1";

type Movement =
  // general (limb joints, including the digits' MCP and IP joints)
  | "flexion" | "extension" | "abduction" | "adduction"
  | "medial-rotation" | "lateral-rotation" | "circumduction"
  // forearm and wrist
  | "pronation" | "supination" | "radial-deviation" | "ulnar-deviation"
  // scapula
  | "elevation" | "depression" | "protraction" | "retraction"
  | "upward-rotation" | "downward-rotation"
  // thumb
  | "opposition" | "reposition"
  // axial
  | "lateral-flexion" | "rotation"
  // ankle and foot
  | "dorsiflexion" | "plantarflexion" | "inversion" | "eversion";
```

Digit movements use the general values together with the specific joint (e.g. a metacarpophalangeal
joint), so "flexion of the index finger at the MCP joint" is `{ joint, movement: "flexion" }`.
Scapular rotation uses `upward-rotation` / `downward-rotation` so it cannot be confused with rotation
of the humerus; "lateral rotation of the scapula" is a synonym handled in prose and search.

## Known deferred gaps
- **Tendons, ducts and lymphatic vessels have no "passes through" yet** (amendment B). For example,
  the carpal tunnel cannot yet derive the flexor tendons as contents, and the tendon of the long
  head of biceps in the intertubercular sulcus cannot be expressed. To be resolved when these
  categories get full schemas (upper-limb slice, Milestone 6), most likely by giving them the same
  conduit shape.
- Categories without a full schema yet (joint, ligament, organ, lymph node group, landmark and
  others) can exist only as stubs until their schema is written.

## Consequences
- Every relationship has exactly one stored side; the graph builder generates the rest.
- Seed content can reference structures that are not yet written, honestly reported as missing.
- Lesion-level deficits and quiz distractor checks can be derived from data.

## Addendum 1 — Blood supply contribution (2026-11-08)

**Context.** Innervation records `contribution`, but blood supply did not, so the main arterial supply of a
muscle could not be distinguished from a minor one. Raised by the owner during the seed spot-check.

**Decision.**
- `Muscle.bloodSupply[]` gains `contribution?: "main" | "minor"`, matching innervation's main/minor
  (blood supply has no `variable` value).
- The field is **optional** and is set **only when the owner has confirmed it**. A missing value is listed
  under "Missing optional fields" in `docs/CONTENT_STATUS.md`; values are not guessed.
- The validator rejects any other value (`unknown-vocabulary`). The graph's "supplies" list carries the value.
- Seed: profunda brachii → triceps brachii is `main` (owner-confirmed). The posterior circumflex humeral and
  superior ulnar collateral supplies to triceps, and the brachial artery supply to brachialis, stay unset.

**Consequences.** Artery pages can rank the muscles they supply, and quiz generation can avoid
treating a minor supplier as a wrong answer, as with innervation.
