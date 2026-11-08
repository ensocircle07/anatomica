# Content guide

How to add or change an anatomy record. The schema itself is the TypeScript in
[`src/content/schema/`](../src/content/schema/); the reasoning behind it is in
[ADR-0011](decisions/0011-content-schema-refinements.md).

## Where records live

| Kind | Folder |
|---|---|
| Bones and bone features | `src/content/entities/osteology/<region>/` |
| Muscles and compartments | `src/content/entities/myology/<region>/` |
| Nerves | `src/content/entities/neurology/<region>/` |
| Arteries and veins | `src/content/entities/angiology/<region>/` |
| Spaces | `src/content/entities/topography/<region>/` |
| Clinical conditions | `src/content/clinical/<region>/` |
| Stubs (referenced, not yet written) | `src/content/entities/stubs/` |

Every new file's records must be added to [`src/content/index.ts`](../src/content/index.ts).

## Rules

1. **One record per structure, one stable ID**, e.g. `nerve.radial`. IDs are never renamed once published.
2. **Store each relationship once**, on its canonical side:

   | Fact | Stored on | Generated on |
   |---|---|---|
   | Nerve supply | the muscle (`innervation`) | the nerve ("muscles supplied") |
   | Attachments | the muscle (`origin`, `heads`, `insertion`) | the bone feature |
   | Branch of | the branch (`origin.from`, `origin.segment`) | the parent ("branches") |
   | Passes through | the nerve or vessel (`course[].through`) | the space, compartment or feature ("contents") |
   | Boundaries | the space (`boundaries`) | the structure ("forms boundary of") |
   | Blood supply | the muscle (`bloodSupply`) | the artery ("supplies") |
   | Clinical involvement | the condition (`involves`) | the structure ("clinical significance") |

3. **British English** (ADR-0008). American spellings go in `synonyms`.
4. **Original wording only.** Textbooks are used to check facts, never as text to copy or paraphrase closely.
5. **Do not guess.** If a value (a root value, an age of ossification, a frequency) is not certain, leave the
   optional field out (it is reported as missing) or use `frequency: "uncertain"`. Where sources disagree,
   record it in `sourcesDisagree` rather than choosing silently.
6. **Citations:** `cite("ref.…")` with `locatorVerified: false`. **Never write a page number** that has not been
   checked against the actual book; the validator rejects unverified page numbers.
7. **Status** (ADR-0003): AI-drafted content is `accuracy: "unchecked"` unless sources were actually compared
   (`cross-checked`). `fact-checked` and `clinically-reviewed` need a human review recorded in `meta.reviews`.
8. **Stubs** let a record refer to something not written yet. A stub has only an ID, category, name, regions,
   systems and status. It cannot be the nerve in an innervation, the parent of a branch with a `segment`,
   or the bone of a feature (ADR-0011 D1).
9. Prose can link to other records with `[[entity.id]]`; the validator checks every link.

## Checking your change

```powershell
npm run validate    # explains every problem, with the record and field
npm run coverage    # regenerates docs/CONTENT_STATUS.md — commit it
npm run verify      # everything GitHub runs before deploying
```
