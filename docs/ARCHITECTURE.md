# ANATOMICA — Architecture and Implementation Plan

> **The Clinical Anatomy Atlas** — *Understand the structure. Understand the consequence.*

| | |
|---|---|
| Status | **Approved** (Phase 1), 2026-11-06 |
| Public URL (planned) | https://ensocircle07.github.io/anatomica/ |
| Repository (planned) | `github.com/ensocircle07/anatomica` |
| Decisions | See [`docs/decisions/`](decisions/) |

This document is the source of truth for how ANATOMICA is built. Changes to it are made through a new decision record in `docs/decisions/`.

---

## 1. Vision

ANATOMICA is a **knowledge graph of the human body with a website on top**, not a collection of pages.

- Every anatomical structure (the median nerve, the humerus, the carpal tunnel) exists **exactly once** as a typed record with a stable ID.
- Regional, systematic, topographical, clinical, diagram, search and quiz views are all different paths through the **same** graph. The femoral nerve is reached via the lower limb, the lumbar plexus, peripheral nerves, the femoral triangle and clinical nerve injuries, and all of them lead to one record.
- Clinical meaning is attached to the graph throughout, not added as a final chapter.
- A separate, plain-language **First Aid** section shares the platform but not the audience, tone or visual design.

Three objectives carry equal weight: anatomical completeness and accuracy, excellent usability, and clinical relevance. Accuracy is never traded for speed or appearance.

---

## 2. Technical architecture

### Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js 26 LTS** | Current Long-Term Support line ([ADR-0009](decisions/0009-node-lts.md)) |
| Build | Vite + TypeScript (strict) | Fast, standard, static output suitable for GitHub Pages |
| UI | React + React Router (declarative mode) | As specified; can be wrapped by Capacitor later |
| Styling | Tailwind CSS v4 | Light/dark mode, responsive layout, consistent design tokens |
| Icons | Lucide | As specified |
| Content | **TypeScript data files** | Editor autocompletion and compile-time errors while authoring |
| Search | MiniSearch | Small, offline, fuzzy and prefix search with field boosting |
| Local data | localStorage (settings, bookmarks); IndexedDB via `idb-keyval` (progress, scheduling) | Free, offline, no account |
| Offline | `vite-plugin-pwa` (later milestone) | First Aid is precached first |
| Tests | Vitest | Graph, search, quiz logic and content validator |

New dependencies are added only with a stated reason.

### Build-time content pipeline

Before every build, scripts:

1. Load every content record.
2. **Validate** it: every referenced ID exists, no duplicate IDs, required fields present, every image registered with an accepted licence, every citation points to a real reference record, no relationship stored on both sides.
3. **Generate reverse relationships** (if a muscle is innervated by the radial nerve, the radial nerve lists that muscle automatically).
4. Generate the search index, the route list and the content-completeness report.

**If validation fails, the site does not deploy.**

### Hard boundary

`src/content` (data) and `src/core` (logic) **never import React or browser DOM APIs**. A lint rule enforces this. This makes the content reusable by search, diagrams, quizzes and a future Android app.

---

## 3. Folder structure

```text
anatomica/
├── .github/workflows/deploy.yml     # Typecheck → validate → test → build → deploy
├── docs/
│   ├── ARCHITECTURE.md              # This document
│   ├── CONTENT_GUIDE.md             # How to write an entity (style, terminology, citations)
│   ├── PROGRESS.md                  # Development progress tracker
│   ├── CONTENT_STATUS.md            # GENERATED completeness report
│   └── decisions/                   # Architecture decision records (ADRs)
├── public/
│   ├── diagrams/<diagram-id>/       # Licensed images and SVGs
│   └── icons/, manifest
├── scripts/
│   ├── validate-content.ts          # Referential integrity, licences, citations
│   ├── build-graph.ts               # Reverse edges, derived lists
│   ├── build-search-index.ts
│   ├── generate-route-shells.ts     # One real index.html per route (ADR-0006)
│   └── coverage-report.ts           # Writes docs/CONTENT_STATUS.md
├── src/
│   ├── content/                     # PURE DATA — no React
│   │   ├── schema/                  # TypeScript types for every entity kind
│   │   ├── taxonomy/                # Regions, subregions, systems, navigation trees
│   │   ├── entities/
│   │   │   ├── osteology/upper-limb/humerus.ts   # a bone and its features
│   │   │   ├── arthrology/  myology/  neurology/  angiology/
│   │   │   ├── lymphatics/  splanchnology/  topography/  landmarks/
│   │   ├── clinical/                # Conditions, examination tests, procedures
│   │   ├── abbreviations/
│   │   ├── references/
│   │   ├── diagrams/                # Diagram definitions and hotspots
│   │   ├── questions/               # Hand-written questions and clinical cases
│   │   ├── first-aid/               # Separate schema and content
│   │   ├── assets/register.ts       # Licence register for every image
│   │   └── manifests/               # Structures that SHOULD exist (completeness)
│   ├── core/                        # PURE LOGIC — no React
│   │   ├── graph/  search/  quiz/  scheduler/  storage/
│   ├── generated/                   # Pipeline output (git-ignored)
│   ├── app/                         # Router, layouts, providers, theme
│   ├── features/                    # atlas, search, diagrams, learn, first-aid, glossary, me
│   ├── components/                  # UI primitives and structure-page sections
│   └── styles/
└── tests/
```

The original specification proposed both `content/` and `data/`. They are merged into `src/content/` to remove ambiguity about where a record belongs.

---

## 4. Content data model

> **Refined by [ADR-0011](decisions/0011-content-schema-refinements.md).** From Milestone 3 the
> authoritative schema is the TypeScript in `src/content/schema/`. The sketches in §4–6 show intent;
> notably, branches, contents, clinical links and diagram references are now stored on one side only.

### Stable IDs

Readable, namespaced and **never renamed** once published:
`nerve.median`, `bone.humerus`, `feature.humerus.radial-groove`, `space.carpal-tunnel`, `condition.radial-nerve-injury`.

### Categories

| Group | Categories |
|---|---|
| Skeletal | `bone`, `bone-feature`, `cartilage` |
| Joints | `joint`, `ligament`, `bursa` |
| Muscular | `muscle`, `tendon`, `fascia`, `retinaculum` |
| Nervous | `nerve`, `plexus`, `plexus-part`, `ganglion`, `dermatome`, `myotome` |
| Vascular | `artery`, `vein`, `lymph-vessel`, `lymph-node-group` |
| Visceral | `organ`, `organ-part`, `peritoneal-structure` |
| Topographical | `region`, `space`, `landmark` |
| Clinical | `condition`, `exam-test`, `procedure` |

Bone features are separate entities because muscles attach to features, foramina transmit structures, and features double as landmarks. **ASIS is one entity** (a bone feature carrying landmark data), never two.

### Base entity

```ts
type EntityId = string;                       // "nerve.median"
type Level = "core" | "advanced" | "specialist";

interface BaseEntity {
  id: EntityId;
  category: Category;
  name: string;                               // British English canonical name (ADR-0008)
  latinName?: string;                         // Terminologia Anatomica
  taId?: string;                              // TA2 identifier where available
  synonyms: string[];                         // "common peroneal nerve", "esophagus"
  abbreviationIds?: string[];                 // → abbreviation records (§7)
  regions: RegionId[];
  systems: SystemId[];
  level: Level;                               // foundational / advanced / specialist
  summary: string;                            // 1–3 sentences
  sections: Partial<Record<SectionKey, Prose>>;
  variations?: Variation[];
  clinical?: ClinicalLink[];                  // §6
  diagramRefs?: DiagramRef[];
  citations: Citation[];
  meta: ContentMeta;                          // review status (§14)
}

// Prose: a small Markdown subset with graph links, e.g.
// "passes through the [[space.quadrangular-space]] with the [[artery.posterior-circumflex-humeral]]"
type Prose = string;

interface Citation {
  refId: string;
  locator?: string;                           // chapter / page
  locatorVerified: boolean;                   // false until a human checks the source
  supports?: string;                          // which field the citation supports
}
```

### Field states

Optional fields have three states:

- **filled**
- **not applicable** — listed in `meta.notApplicable` (e.g. an oesophagus has no "poles")
- **missing**

Only *missing* counts against completeness.

### Relationships: stored once, both directions generated

Each edge type has one **canonical storage side**. The pipeline generates the inverse.

| Edge | Stored on | Shown automatically on |
|---|---|---|
| innervation | muscle (`innervation[]`) | nerve → "Muscles supplied" |
| attachment | muscle (`origin[]`, `insertion[]`) | bone feature → "Attachments" |
| branchOf / tributaryOf | the branch | parent vessel or nerve → "Branches" |
| contents / passesThrough | space (`contents[]`) | nerve or vessel → "Passes through" |
| boundedBy | space (`boundaries[]`) | muscle or bone → "Forms boundary of" |
| articulatesWith | joint (`surfaces[]`) | bone → "Articulations" |
| arterial supply | target (muscle, organ) | artery → "Supplies" |
| involves (clinical) | condition | structure → "Clinical significance" |

The validator **forbids storing the same fact on both sides**. Prose explanations remain alongside structured edges for educational context.

---

## 5. Specialised templates

```ts
interface Bone extends BaseEntity {
  classification: "long" | "short" | "flat" | "irregular" | "sesamoid" | "pneumatic";
  sideIdentification?: Prose;
  parts: EntityId[];                          // feature IDs: head, necks, shaft, condyles…
  ossification?: { centres: OssificationCentre[]; notes?: Prose };
  radiology?: Prose;
  // Attachments, articulations and transmitted structures are DERIVED
}

interface BoneFeature extends BaseEntity {
  bone: EntityId;
  kind: "process" | "tubercle" | "tuberosity" | "spine" | "condyle" | "epicondyle" | "head" | "neck"
      | "fossa" | "groove" | "notch" | "foramen" | "canal" | "facet" | "surface" | "border"
      | "angle" | "line" | "crest";
  transmits?: EntityId[];                     // foramina and canals
  palpability?: Palpability;                  // reused by landmarks
}

interface Muscle extends BaseEntity {
  compartment?: EntityId;
  layer?: string;
  depth: "superficial" | "intermediate" | "deep";
  origin: Attachment[];                       // { site: EntityId; detail?: Prose }
  insertion: Attachment[];
  innervation: { nerve: EntityId; roots: RootValue; note?: Prose }[];
  bloodSupply: EntityId[];
  actions: { joint: EntityId; movement: Movement; role: "prime" | "secondary" | "stabiliser" }[];
  palpation?: Prose;
  // Synergists and antagonists are DERIVED by comparing actions
}

interface RootValue {
  typical: Segment[];                         // ["C5", "C6"]
  predominant?: Segment[];
  sourcesDisagree?: { note: Prose; citations: Citation[] };
}

interface Joint extends BaseEntity {
  structural: "fibrous" | "cartilaginous" | "synovial";
  subtype: string;                            // hinge, ball-and-socket…
  functional?: "synarthrosis" | "amphiarthrosis" | "diarthrosis";
  surfaces: EntityId[];
  ligaments: EntityId[];
  intraArticular?: EntityId[];                // menisci, discs, labra
  capsule?: Prose;
  synovium?: Prose;
  bursae?: EntityId[];
  movements: { movement: Movement; axis?: string; range?: { text: string; citation: Citation } }[];
  // Muscles producing each movement are DERIVED from Muscle.actions
  stability: Prose;
  bloodSupply: EntityId[];
  innervation: EntityId[];
}

interface Nerve extends BaseEntity {
  modality: "motor" | "sensory" | "mixed";
  fibres?: ("somatic" | "sympathetic" | "parasympathetic" | "visceral-afferent")[];
  roots: RootValue;
  origin: { from: EntityId; note?: Prose };   // e.g. plexus-part.brachial.posterior-cord
  course: CourseSegment[];                    // ORDERED, proximal → distal
  terminatesAs?: EntityId[];
  sensory?: { territory: Prose; cutaneousBranches: EntityId[] };
  // Motor supply is DERIVED from Muscle.innervation
}

interface CourseSegment {
  order: number;
  through?: EntityId;                         // a space, canal or groove
  relations: { structure: EntityId; position: Position; note?: Prose }[];
  branchesGiven?: EntityId[];                 // enables lesion-level reasoning
  text: Prose;
}

interface Artery extends BaseEntity {
  origin: { from: EntityId; landmark?: EntityId; vertebralLevel?: string };
  continuesAs?: EntityId;
  course: CourseSegment[];
  territory: Prose;
  anastomoses: { with: EntityId[]; name?: string; clinical?: Prose }[];
  pulsePoint?: EntityId;                      // → landmark
}

interface Vein extends BaseEntity {
  system: "superficial" | "deep" | "perforator" | "sinus" | "portal";
  drainsInto: EntityId;
  course?: CourseSegment[];
  valves?: Prose;
  communications?: { with: EntityId; via?: string; portosystemic?: boolean }[];
}

interface LymphNodeGroup extends BaseEntity {
  drainsFrom: EntityId[];
  drainsTo: EntityId[];
  palpable?: boolean;
}

interface Organ extends BaseEntity {
  location: { region: EntityId; quadrant?: string;
              vertebralLevel?: { from: string; to: string; note?: Prose } };
  peritoneal: "intraperitoneal" | "primarily-retroperitoneal" | "secondarily-retroperitoneal"
            | "subperitoneal" | "not-applicable";
  shapeOrientation?: Prose;
  internalStructure?: Prose;
  parts: EntityId[];                          // organ-part entities
  surfaces?: Prose;
  borders?: Prose;
  poles?: Prose;
  hilum?: { contents: EntityId[]; arrangement: Prose };
  relations: { direction: Position; structure: EntityId; separatedBy?: EntityId; note?: Prose }[];
  arterialSupply: EntityId[];
  venousDrainage: EntityId[];
  lymphaticDrainage: EntityId[];
  innervation: { sympathetic?: EntityId[]; parasympathetic?: EntityId[];
                 visceralAfferent?: Prose; referredPain?: EntityId[] };
  supports?: EntityId[];
  surfaceProjection?: Prose;
}

interface Space extends BaseEntity {
  boundaries: { side: "roof" | "floor" | "apex" | "base" | "anterior" | "posterior"
                    | "medial" | "lateral" | "superior" | "inferior";
                formedBy: EntityId[]; note?: Prose }[];
  contents: { structure: EntityId; arrangement?: string }[];   // ordered, e.g. lateral → medial
  contentsMnemonic?: { text: string; caveat?: string };
  communications: { space: EntityId; via: Prose }[];
  surfaceLandmarks?: EntityId[];
}

interface Landmark extends BaseEntity {
  underlying: EntityId;                       // usually a bone feature, artery or organ
  palpability: "reliably-palpable" | "variably-palpable" | "surface-projection-only";
  howToLocate: Prose;
  surfaceProjection?: Prose;
  vertebralLevel?: string;
  examination?: Prose;
  procedures?: EntityId[];
  precautions?: Prose;
}
```

Structure pages render a **category-specific layout**. Organs, nerves, vessels and bones are not forced into an identical template.

---

## 6. Clinical correlation model

Clinical conditions are first-class entities linked to anatomy by typed roles.

```ts
type Frequency = "common" | "uncommon" | "rare" | "uncertain";

interface ClinicalCondition extends BaseEntity {
  kind: "fracture" | "dislocation" | "nerve-lesion" | "entrapment" | "vascular" | "visceral"
      | "infection-spread" | "hernia" | "ligament-injury" | "degeneration" | "other";
  involves: { structure: EntityId;
              role: "injured" | "endangered" | "compressed" | "denervated" | "ischaemic"
                  | "obstructed" | "route-of-spread" }[];
  mechanism: Prose;                           // REQUIRED: the anatomical reasoning
  presentation: Prose;
  signs?: string[];                           // e.g. "wrist drop" — searchable
  examination?: EntityId[];                   // exam-test entities
  investigations?: Prose;
  complications?: { text: Prose; frequency: Frequency }[];
  frequency?: Frequency;                      // always with a citation
  procedural?: Prose;
}

interface ClinicalLink { condition: EntityId; context?: Prose }
```

- `mechanism` is mandatory, so every clinical fact carries its anatomical explanation.
- `Frequency` turns "distinguish common from rare" and "say when evidence is uncertain" into data.
- **Derived deficits:** nerve course segments record where branches arise, so a lesion at a given level can automatically list the muscles that lose supply (the basis of the lesion-level tool, §20).

---

## 7. Abbreviation management

Many abbreviations collide:

| Short | Collisions |
|---|---|
| FN | femoral nerve / facial nerve |
| PA | popliteal artery / pulmonary artery / posteroanterior (radiograph) |
| IMA | inferior mesenteric artery / internal mammary artery |
| SCA | subclavian artery / superior cerebellar artery |
| BA | brachial artery / basilar artery |
| AA | axillary artery / ascending aorta / abdominal aorta |
| RA | radial artery / right atrium |
| PV | portal vein / pulmonary vein |
| PN | phrenic nerve / pudendal nerve / peripheral neuropathy |
| MN, SN, TN | not widely standard for median / sciatic / tibial nerve; TN usually means trigeminal neuralgia |
| CFN | valid, but clinicians commonly use CPN (common peroneal nerve) |

```ts
interface Abbreviation {
  id: string;
  short: string;
  expansions: {
    target: EntityId | string;
    standing: "standard" | "common-clinical" | "context-dependent" | "project-shorthand";
    contexts: string[];
    citation?: Citation;
  }[];
}
```

Rules:

- The `<Abbr>` component shows the **full name on first use on every page**; tables read "Popliteal artery (PA)".
- `project-shorthand` is visibly labelled and never presented as international terminology.
- Searching an ambiguous short form shows a disambiguation panel.
- The glossary is generated from these records.

---

## 8. Regional and systematic navigation

Navigation trees are **curated data** in `src/content/taxonomy/` referencing entity IDs.

- **Region hubs** — eight regions, each with subregions (e.g. Upper limb → Shoulder / Axilla / Arm / Cubital fossa / Forearm / Wrist / Hand), listing bones, muscles by compartment, nerves, vessels, spaces, landmarks, diagrams and clinical topics.
- **System hubs** — Osteology, **Arthrology (joints and ligaments)** ([ADR-0002](decisions/0002-merge-syndesmology-into-arthrology.md)), Myology, Neurology, Angiology, Lymphatics, Splanchnology, Topography, Surface anatomy and landmarks, Clinical anatomy. Each is a hierarchy, e.g. Neurology → Plexuses → Brachial → Posterior cord → Radial nerve.
- **One canonical URL per entity**, e.g. `/nerves/median-nerve`.
- **Breadcrumbs** show the canonical system path. An **"Appears in"** panel lists every region, space, plexus and condition the entity belongs to.

Main navigation: Home · Regional Anatomy · Systematic Anatomy · Topographical Anatomy · Anatomical Landmarks · Clinical Anatomy · Learning and Exams · First Aid · Glossary · Bookmarks and Progress. On mobile it collapses to a bottom bar: Atlas / Search / Learn / First Aid / Me.

---

## 9. Splanchnology integration

- Organs are full entities; their **parts** (stomach fundus, renal pelvis, bronchopulmonary segments) are separate `organ-part` entities targetable by diagrams, questions and relationships.
- **The peritoneum is modelled explicitly**: reflections, omenta, mesenteries and peritoneal ligaments as `peritoneal-structure` entities; the greater sac, lesser sac, epiploic foramen, subphrenic spaces and paracolic gutters as `space` entities. This explains how fluid, infection and pain spread.
- **Visceral innervation links to dermatomes**, so referred pain (e.g. appendix → periumbilical → right iliac fossa) is a navigable path.
- Organ pages render an automatic **relations compass** from `relations[]`.
- The heart is one record tagged with both splanchnology (cardiovascular organs) and angiology. The mammary gland is tagged with the thorax region and the female reproductive section.

---

## 10. First Aid architecture

**ANATOMICA FIRST AID — Practical Emergency Knowledge for Everyone** is a separate product inside the same app.

- Its own route tree (`/first-aid/...`), layout, navigation and visual theme: larger type, high contrast, emergency accent colour, no anatomy jargon.
- Its own schema, following the mandatory nine-point template:

```ts
interface FirstAidTopic {
  id: string;
  title: string;
  category: "basics" | "bleeding-injuries" | "medical" | "environmental" | "special";
  whatItIs: string;
  recognise: string[];
  warningSigns: string[];
  actions: { step: number; text: string; important?: boolean }[];
  doNot: string[];
  callEmergencyWhen: string[];
  monitorWhileWaiting: string[];
  tellResponders: string[];
  seekProfessionalCareWhen: string[];
  populationNotes?: { infant?: string; child?: string; pregnancy?: string; olderAdult?: string };
  sources: { organisation: string; document: string; year: number; url: string; accessed: string }[];
  reviewedOn: string;
  nextReviewDue: string;
  reviewedBy?: string;
}
```

- If `nextReviewDue` has passed, the page shows a visible **"review overdue"** notice.
- **Emergency numbers** come from a per-country dataset in which every entry cites an official source. No single global number is assumed; unverified countries show "check your local emergency number".
- Sources: IFRC first-aid guidelines, ILCOR, European Resuscitation Council and other Resuscitation Council guidelines, AHA / Red Cross, WHO. The latest edition is confirmed when each topic is written.
- No invasive procedures and no drug dosing beyond what lay-rescuer guidelines explicitly endorse (e.g. helping someone use their own adrenaline auto-injector). Every page encourages certified first-aid training.
- **Offline first**: First Aid is the first content precached by the PWA.
- A one-way "Learn the anatomy behind this" link leads into the atlas; the atlas does not intrude on First Aid's simple flow.
- A prominent disclaimer: educational resource, not medical advice, not a substitute for training.

---

## 11. Interactive diagrams

Open-licence images with aligned bone, muscle, nerve and vessel layers of the same view are rare. Strategy:

1. **Hotspot overlays on licensed images** — normalised polygons or SVG-element hotspots mapped to entity IDs; labelled, unlabelled and quiz modes on any image.
2. **Original schematic SVGs** — brachial and lumbosacral plexuses, space contents (femoral triangle, carpal tunnel, cubital fossa), cross-sections, peritoneal reflections. Drawn by the project and licensed CC BY-SA 4.0.
3. **Layer toggles only where a coherent layered set exists.** The model supports layers from day one; they are never faked.
4. **Internal hotspot editor** — a developer page for clicking outlines over an image and exporting JSON. Built before large-scale diagram work.

```ts
interface Diagram {
  id: string;
  title: string;
  view: "anterior" | "posterior" | "medial" | "lateral" | "superior" | "inferior" | "section";
  region: RegionId;
  orientation: { up: string; left: string };
  layers: { id: string;
            kind: "bones" | "muscles" | "nerves" | "arteries" | "veins" | "organs" | "ligaments" | "spaces";
            assetId: string }[];
  hotspots: { entityId: EntityId; layerId: string; shape: Polygon | { svgElementId: string } }[];
}
```

Every hover interaction has a tap equivalent. 3D is out of scope for the initial version.

---

## 12. Search architecture

- **Index built at build time** from name, synonyms, Latin name, abbreviations, clinical signs, region and system. Field weighting: name and abbreviation > synonyms > Latin > summary.
- **Normalisation**: British/American spelling (oesophagus/esophagus, haemorrhage/hemorrhage), fibular/peroneal, plurals, possessives (McBurney's → mcburney).
- **Fuzzy and prefix matching**, with suggestions while typing.
- **Abbreviations**: exact matches boosted; ambiguous forms show disambiguation.
- **Relationship expansion**: after direct matches, add graph neighbours. "Radial groove" → the groove → radial nerve and profunda brachii artery (`passesThrough`) → humeral shaft fracture. "Wrist drop" → condition sign → radial nerve injury → wrist extensors (derived).
- **Results grouped by category**; the index is lazy-loaded.

No AI service and no server are involved.

Acceptance examples: `MCN`, `SMA`, `ASIS`, `snuffbox`, `wrist drop`, `McBurney`, `radial groove`, `carpal tunnel`.

---

## 13. Learning and examination

### Question sources

1. **Generated from the graph** — "Which nerve supplies X?", "Identify the muscle from its origin and insertion", "Which structure lies in space Y?", "Which branch arises in segment Z?". Scales with content and covers rarely examined structures.
   - The generator **verifies that no distractor is also correct** (e.g. brachialis receives a small supply from the radial nerve in addition to the musculocutaneous nerve).
2. **Hand-written** — clinical vignettes, variations, "explain the spread" reasoning questions.

```ts
interface Question {
  id: string;
  type: "mcq-single" | "mcq-multi" | "identify-diagram" | "label-diagram" | "order" | "match" | "case";
  skills: Skill[];        // identification, location, attachments, innervation, blood-supply,
                          // relations, functional, topographical, clinical, variations, landmarks
  difficulty: 1 | 2 | 3;
  level: Level;
  entityIds: EntityId[];
  stem: Prose;
  options?: Option[];
  answer: Answer;
  explanation: Prose;
  citations: Citation[];
}
```

### Engine (`src/core/quiz`, no React)

Session builder (filter by region, system, skill, difficulty; randomise; timed exams), scoring with a per-skill breakdown, incorrect-answer review queue, spaced-repetition flashcards (SM-2 first; FSRS possible later), quick revision mode. Progress, bookmarks and favourites go through a `Storage` interface backed by IndexedDB.

---

## 14. References and content validation

AI-drafted content is **not** equivalent to verified content. The workflow reflects this.

- **Reference records**: textbook (title, edition, year, publisher, ISBN), article (DOI), guideline (organisation, year, URL), terminology (TA2). Citations carry `locatorVerified: false` until a human checks the source. **Page numbers are never invented.**
- **Original wording only.** Textbooks are used to check facts, never as text to copy or paraphrase closely.
- **Multi-dimensional status** ([ADR-0003](decisions/0003-multi-dimensional-content-status.md)):

| Dimension | Values |
|---|---|
| Writing | `not-started` · `in-progress` · `draft-complete` |
| Accuracy | `unchecked` · `cross-checked` (sources compared) · `fact-checked` (human) |
| Clinical | `none` · `drafted` · `clinically-reviewed` (qualified reviewer) |
| Diagram | `none` · `linked` · `complete` |

"Complete" is **computed** and true only when every dimension is complete.

- **Every page shows a status badge**, e.g. "Draft — not yet expert-reviewed".
- **Completeness is measured against manifests** — lists of structures that *should* exist per region and system, seeded from Terminologia Anatomica 2. The generated `docs/CONTENT_STATUS.md` reports e.g. "Forearm: 19/20 muscles, 1 missing".
- Disagreements between sources are stored (`sourcesDisagree`), not silently resolved.
- Medical content review is a separate process from software testing.
- Reviewer status: see [ADR-0010](decisions/0010-content-reviewer.md).

---

## 15. Image licensing

Policy ([ADR-0004](decisions/0004-licensing-policy.md)):

- **Accepted**: public domain, CC0, CC BY, CC BY-SA.
- **Rejected**: any NonCommercial (NC) or NoDerivatives (ND) licence, and anything with unclear terms.
- **Asset register** (`src/content/assets/register.ts`): file, title, author, source URL, SPDX licence, licence URL, exact attribution text, modifications, date verified.
- The validator **fails the build** for any unregistered image in `public/`.
- Credits appear under every diagram; a full Credits page is generated from the register.
- Candidate sources: Wikimedia Commons (including public-domain 1918 Gray's plates — accurate but older terminology), OpenStax Anatomy & Physiology 2e (CC BY 4.0), Servier Medical Art (CC BY 4.0), Z-Anatomy / BodyParts3D (CC BY-SA, later). Each licence is verified per file at the time of use.
- Not reusable (cite only): Radiopaedia, StatPearls, TeachMeAnatomy, textbook illustrations.

**Project licences:** code — MIT; content (text, data, original diagrams) — CC BY-SA 4.0.

---

## 16. GitHub Pages deployment

([ADR-0006](decisions/0006-routing-static-route-shells.md), [ADR-0007](decisions/0007-github-repository.md))

- Repository `ensocircle07/anatomica`; site `https://ensocircle07.github.io/anatomica/`.
- Vite `base: "/anatomica/"`.
- Official GitHub Actions Pages workflow on every push to `main`: **typecheck → validate content → tests → build → generate route shells → deploy**. Any failure stops deployment.
- **Static route shells**: a post-build script writes a real `index.html` for every route with its own `<title>` and meta description. Direct links and refreshes return HTTP 200 and pages are indexable.
- A minimal page is deployed early in Phase 2 to verify the pipeline.
- Deployment is not "done" until the live URL has been loaded, including a refresh on a nested route, on desktop and mobile.

---

## 17. Future Android compatibility

- `src/content` and `src/core` are pure TypeScript (lint-enforced).
- Storage goes through an interface (IndexedDB now; Capacitor Preferences or SQLite later).
- No hover-only interactions; touch targets ≥ 44 px.
- Content bundled and usable offline (the PWA is the first step).
- When the web platform is stable, **Capacitor** wraps the same build output. Folders can later become packages (`content`, `core`, `web`) without rewriting.
- No Android work begins until the web platform is stable.

---

## 18. Known weaknesses and risks

1. **Scope versus review capacity.** Roughly 206 bones and well over 1,000 bony features, ~600–700 muscles, several hundred named nerves and branches, several hundred arteries and veins, ~100 spaces, hundreds of landmarks and conditions: **≈3,000–5,000 entities**. Code takes months; content writing and review is a multi-year effort. Value is delivered in layers: `core` level everywhere first, then `advanced` and `specialist`.
2. **Human review is required** for `fact-checked` and `clinically-reviewed`. Until a reviewer is involved, the site presents itself as a draft atlas.
3. **Roadmap order** — the original Phase 5-before-6-before-7 order conflicted with building one region to full quality. Resolved by the vertical slice ([ADR-0001](decisions/0001-vertical-slice-upper-limb-first.md)).
4. **System-by-system population breaks topography** — spaces need bones, muscles, nerves and vessels present together. Resolved by region-by-region population.
5. **Linear status scale** did not fit parallel work. Resolved by ADR-0003.
6. **Uniform templates** — resolved by filled / not-applicable / missing field states.
7. **Non-standard and colliding abbreviations** in the original examples — resolved by §7.
8. **Missing entity categories** — resolved by §4.
9. **Syndesmology duplicating arthrology** — resolved by ADR-0002.
10. **Radiological anatomy** — openly licensed radiology images are scarce (Radiopaedia is NC); expect limited coverage.
11. **Layered diagrams** depend on art that may not exist openly; hotspots and original schematics are the realistic core.
12. **Textbook disagreement** on root values and ranges — stored explicitly.
13. **Medical liability** — clear disclaimers, especially in First Aid.
14. **Bundle size at scale** — content code-split by region; search index lazy-loaded.

---

## 19. Development roadmap

Each milestone ends in a working, tested state and a pause for approval.

| # | Milestone | Scope | Done when |
|---|---|---|---|
| 1 | Architecture | This document and decision records | ✅ Approved 2026-11-06 |
| 2 | Foundation | Node 26 LTS; Vite/React/TS/Tailwind/Router scaffold; Git repo; README; licences; deploy pipeline; live minimal page | Public URL loads; nested-route refresh works |
| 3 | Content engine | Schema types; validator; graph builder; coverage report; ~10 seed entities (humerus and features, radial nerve, triceps brachii, brachialis, profunda brachii artery, quadrangular space, humeral shaft fracture…) | `npm run validate` passes; graph tests pass |
| 4 | Atlas UI | App shell, light/dark theme, home, region and system hubs, category-specific structure pages, "Appears in", breadcrumbs, `<Abbr>` | Seed entities fully navigable on desktop and mobile |
| 5 | Search | Index pipeline, normalisation, disambiguation, graph expansion, grouped results | All §12 acceptance examples pass in tests |
| 6 | Upper limb vertical slice | All upper-limb bones, features, joints, ligaments, muscles, nerves (incl. brachial plexus), vessels, lymph groups, spaces, landmarks, clinical conditions; shoulder → arm → cubital fossa → forearm → hand | Manifest coverage 100% at `core`, then `advanced` |
| 7 | Diagrams | Asset register, credits page, hotspot editor, upper-limb diagrams, plexus and space schematics | Diagram click opens structure; quiz mode works |
| 8 | Learning | Question generator with distractor check, authored cases, flashcards (SM-2), timed exams, progress, bookmarks | Full upper-limb exam runs end to end; progress persists |
| 9 | First Aid | Separate section; emergency-number dataset; first 10 topics (CPR, AED, choking, severe bleeding, recovery position, stroke, heart attack, anaphylaxis, seizures, burns); PWA offline | Works offline; every topic has sources and review dates |
| 10 | Quality gate | Accessibility, mobile, performance, owner review of the slice | Slice approved as the quality standard |
| 11 | Expansion | Lower limb → back → thorax → abdomen → pelvis and perineum → neck → head; remaining First Aid topics | Region by region, same quality gate |
| 12 | Android preparation | Architecture review, Capacitor proof of concept | Only after the web platform is stable |

Milestone 9 (First Aid) is independent of the anatomy graph and may be moved earlier if desired.

---

## 20. Recommendations for comprehensiveness and usefulness

1. **Measure completeness against manifests**, not against pages that exist.
2. **Let the graph do the work** — derived motor-supply lists, attachment maps, synergists, space contents and generated questions mean each fact is written once and reused many times.
3. **Lesion-level reasoning tool** — choose a nerve and level of injury; see affected muscles, sensory loss and expected deformity, derived from course-segment data.
4. **Mandatory `mechanism`** on every clinical condition.
5. **Disagreement and frequency stored as data**, not tone.
6. **Review status visible on every page.**
7. **Involve a human reviewer early**, starting with the upper-limb slice.
8. **Build the hotspot editor before drawing diagrams.**
