# ADR-0012: Atlas UI — URLs, indexing, navigation and loading

- **Status:** Accepted
- **Date:** 2026-11-08
- **Refines:** [`ARCHITECTURE.md` §8, §16](../ARCHITECTURE.md), [ADR-0006](0006-routing-static-route-shells.md)

## Context
Milestone 4 builds the atlas pages on the seed graph. The owner approved the plan on 2026-11-08
with the answers recorded below.

## Decision

### 1. URLs come from the entity ID, not its name
An entity's URL is derived from its stable ID, so URLs are as stable as IDs (never renamed):
the category's section, then the ID's parts after the prefix, joined by `/`.

| ID | URL |
|---|---|
| `nerve.radial` | `/nerves/radial` |
| `bone.humerus` | `/bones/humerus` |
| `feature.humerus.radial-groove` | `/bones/humerus/radial-groove` (nested under its bone) |
| `compartment.arm.posterior` | `/compartments/arm/posterior` |
| `condition.humeral-shaft-fracture` | `/clinical/humeral-shaft-fracture` |

This replaces the name-based example in `ARCHITECTURE.md` §8 (`/nerves/median-nerve`).
Every category has a section in `src/core/urls.ts` (checked at compile time). The validator requires a
bone feature's ID to name its bone (`feature.<bone>.…`) so the nested URL is always correct, and a test
requires every generated URL to be unique.

### 2. Stubs get minimal pages
Every link works. A stub page shows the name, a "Not yet written" badge and what refers to it.

### 3. Unbuilt sections stay out of the navigation
Search, Learn, First Aid, Me and Glossary appear only when their milestones are built.

### 4. `<Abbr>` is deferred to Milestone 5
The abbreviation schema, validator rule and `<Abbr>` component are built together with search and the
glossary in Milestone 5, where the abbreviation records are first needed. The seed text currently uses
no abbreviations.

### 5. No new runtime dependencies; graph built in the browser
The graph is built from the bundled content when the app loads. Display logic (breadcrumbs, "Appears in",
URLs, indexing) lives in `src/core` and is unit-tested. A **smoke test renders every generated route with
`react-dom/server`** and fails on any thrown error or React console error, on any page without exactly one
`<h1>`, and on any skipped heading level.

### 6. Indexing follows review status
- An **entity page is `noindex` while its accuracy is `unchecked`** (and always for stubs). It becomes
  indexable automatically once accuracy is `cross-checked` or `fact-checked`. This is computed from
  `meta.status`, never stored.
- Non-entity pages (home, hubs, about) are indexable.
- The route shell writes the `robots` meta tag at build time; the app updates it on client-side navigation.

### 7. Accessibility baseline
Skip-to-content link; exactly one `<h1>` per page with headings in order; the status badge's details open
from the keyboard (a real `<button>` with `aria-expanded`, closed with Escape); visible focus outlines on
every interactive element; nothing operable only by hover; touch targets of at least 44 px.

### 8. Theme
System / Light / Dark toggle, stored per browser (`localStorage`, failures ignored). An inline script in
`index.html` applies the theme before first paint. Colours are CSS-variable tokens with light and dark values;
a test checks text/background token pairs against WCAG AA contrast.

## Known limitation — eager loading
**All content loads eagerly**: every record is in the main JavaScript bundle and the whole graph is built on
start-up. This is fine for the seed (41 records) but will not scale to the ≈3,000–5,000 planned entities
(`ARCHITECTURE.md` §18.14). **This must be revisited after the upper-limb slice (Milestone 6)**: code-split
content by region, and precompute the graph and route data at build time.

## Consequences
- URLs never change when a display name is corrected.
- Search engines do not index unreviewed anatomy; the site still works fully for readers.
- The smoke test catches broken pages in CI before deployment.
