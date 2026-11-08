# Development progress

Roadmap: [`ARCHITECTURE.md` §19](ARCHITECTURE.md#19-development-roadmap). Each milestone ends with owner approval before the next begins.

| # | Milestone | Status | Approved |
|---|---|---|---|
| 1 | Architecture | ✅ Complete | 2026-11-06 |
| 2 | Foundation | 🔄 Open only for the owner's phone check | — |
| 3 | Content engine | ✅ Complete (seed spot-check open) | 2026-11-08 |
| 4 | Atlas UI | 🔄 In progress | — |
| 5 | Search | ⏳ Not started | — |
| 6 | Upper limb vertical slice | ⏳ Not started | — |
| 7 | Diagrams | ⏳ Not started | — |
| 8 | Learning | ⏳ Not started | — |
| 9 | First Aid | ⏳ Not started | — |
| 10 | Quality gate | ⏳ Not started | — |
| 11 | Expansion | ⏳ Not started | — |
| 12 | Android preparation | ⏳ Not started | — |

---

## Milestone 1 — Architecture ✅

- [x] Environment inspected (empty folder; Node 25 found; Git present; no GitHub CLI)
- [x] Architecture plan written: `docs/ARCHITECTURE.md`
- [x] Decisions recorded: `docs/decisions/0001`–`0010`
- [x] Git identity set: `ensocircle07` / GitHub no-reply email (ADR-0007)

## Milestone 2 — Foundation 🔄

- [x] Node.js 26.13.0 LTS installed (installer SHA-256 verified) — ADR-0009
- [x] Vite 8 + React 19 + TypeScript 7 + Tailwind CSS 4 + React Router 8 + Lucide
- [x] Three TypeScript projects; `src/content` and `src/core` compiled without browser types
- [x] Boundary check script (`npm run check:boundaries`), verified to reject a React import
- [x] Placeholder pages: `/`, `/about`, `/about/build` (nested route), "not found" page
- [x] Route shells: one `index.html` per route + `404.html` (ADR-0006)
- [x] Vitest set up; 7 tests passing (routes and route shells)
- [x] `npm run verify` passes locally
- [x] Build tested with a GitHub-Pages-like local server: deep links return 200, unknown paths 404
- [x] GitHub Actions deploy workflow
- [x] README, MIT licence, CC BY-SA 4.0 content licence
- [x] Local Git repository and first commit (`8a31355`)
- [x] GitHub repository `ensocircle07/anatomica` created (public)
- [x] GitHub Pages source set to "GitHub Actions"
- [x] First deployment succeeded (Actions run 42222899128, ~3 min)
- [x] Live site checked over HTTP: `/`, `/about/`, `/about/build/` → 200 with correct titles; `/about/build` → 301 to trailing slash → 200; unknown path → 404 with "Page not found"; JS and CSS → 200
- [x] Live site rendered in headless Microsoft Edge: home, `/about/build` (direct load = refresh; shows commit `8a31355`) and the not-found page all render
- [x] Desktop layout (1280 px) checked by screenshot
- [x] Narrow layout checked at 500 px by screenshot (single column, nothing cut off)
- [ ] Real phone (≈390 px) check by the owner: headless Edge cannot render narrower than ~500 px — **still open** (owner, 2026-11-08: not done yet)

## Milestone 3 — Content engine ✅

Started 2026-11-08 with the owner's approval; Milestone 2's phone check is still open.

- [x] Schema proposal approved with amendments A–D; recorded in ADR-0011
- [x] Step 1 — Schema types (`src/content/schema/`)
- [x] Step 2 — Taxonomy (regions, systems) and 3 reference records (no unconfirmed details, no locators)
- [x] Step 3 — Seed: 14 full records + 27 stubs; all accuracy `unchecked`, all citations `locatorVerified: false`
- [x] Step 4 — Validator (`npm run validate`, 29 rules), one failing-example test per rule
- [x] Step 5 — Graph builder (reverse relationships), lesion-level deficits, synergists/antagonists, distractor check
- [x] Step 6 — Seed manifest and coverage report (`npm run coverage` → `docs/CONTENT_STATUS.md`)
- [x] Step 7 — Graph tests, incl. brachialis distractor case and quadrangular-space derived contents (68 tests in total)
- [x] Step 8 — `validate` and coverage check wired into `npm run verify` and the deploy workflow; confirmed that invalid content exits with code 1
- [x] Step 9 — `CONTENT_GUIDE.md`, README, this tracker
- [x] Owner approved steps 5–9 and the generated `CONTENT_STATUS.md` (2026-11-08)
- [x] Pushed `981cc9a`; Actions run 42482947906 succeeded, with separate passing steps for Typecheck, Boundary check, **Validate content**, **Check docs/CONTENT_STATUS.md is up to date**, Tests and Build
- [x] Live `/about/build/` returns 200 and its bundle contains commit `981cc9a`

### Open: owner spot-check of the AI-drafted seed content

All seed records are `accuracy: unchecked`. Check against your sources, least certain first.
After checking, update the record (and `meta.status.accuracy` only if sources were actually compared).

- [ ] **Triceps nerve supply split** (`src/content/entities/myology/upper-limb/arm.ts`): long head and part of the medial head from branches arising in the axilla; lateral head and the rest of the medial head from branches arising in the radial groove. Roots C6–C8, mainly C7. The lesion-level logic depends on this.
- [ ] **Triceps blood supply:** profunda brachii is now recorded as `contribution: "main"` (owner-confirmed; ADR-0011 addendum 1, 2026-11-08). Still to check, and to mark main/minor where you confirm: posterior circumflex humeral to the long and lateral heads; superior ulnar collateral to the medial head.
- [ ] **Triceps origins and insertion:** lateral head above the radial groove; medial head below it plus both intermuscular septa; insertion on the posterior part of the olecranon's superior surface.
- [ ] **Brachialis:** origin from the distal half of the anteromedial and anterolateral surfaces plus both septa; insertion on the coronoid process and ulnar tuberosity; musculocutaneous roots C5–C6; the radial supply to a lateral part only. Blood supply lists only the brachial artery (probably incomplete). Root value of the radial branch is deliberately missing.
- [ ] **Root values:** musculocutaneous C5–C7, axillary C5–C6, radial C5–T1.
- [ ] **Radial nerve course** (`src/content/entities/neurology/upper-limb/nerves.ts`): axilla → triangular interval → radial groove → pierces the lateral intermuscular septum → between brachialis and brachioradialis → divides in front of the lateral epicondyle. Check the relation positions in each segment.
- [ ] **Profunda brachii:** origin, termination as the middle and radial collateral arteries, anastomosis with the posterior circumflex humeral artery.
- [ ] **Quadrangular space boundaries:** teres minor above (subscapularis note), teres major below, long head of triceps medially, surgical neck laterally.
- [ ] **Humerus:** side-identification text; the list of 8 ossification centres (no ages recorded).
- [ ] **Humeral shaft fracture:** the triceps-sparing statement and the area of sensory loss; palsy frequency left `uncertain`.
- [ ] **Triceps variation:** axillary nerve branch to the long head, frequency `uncertain`.
- [ ] **References:** which editions of Gray's Anatomy and Clinically Oriented Anatomy you actually have (records say 42nd and 9th, marked unconfirmed).
- [ ] **Latin names and synonyms:** e.g. "circumflex nerve", "quadrilateral space", "deep brachial artery", "Sulcus nervi radialis".

### Notes

- An older global npm (10.5.2, in `C:\Users\42077\AppData\Roaming\npm\node_modules\npm`) takes precedence over the npm 11.20.0 bundled with Node 26 on this computer. It works with Node 26 and is **deliberately left in place** (owner's decision). Optional removal: `npm uninstall -g npm`, which removes only that npm copy and its `npm`/`npx` launchers; undo with `npm install -g npm@10.5.2`.

## Milestone 4 — Atlas UI 🔄

Plan approved 2026-11-08 with answers recorded in ADR-0012 (ID-based URLs; stub pages; only built sections
in the navigation; `<Abbr>` deferred to Milestone 5; no new dependencies plus a server-render smoke test;
entity pages noindex while accuracy is unchecked). Phone check (Milestone 2) still open.

- [x] Step 1 — ADR-0012
- [x] Step 2 — Theme tokens (light/dark CSS variables), System/Light/Dark toggle, pre-paint script; WCAG AA contrast test
- [x] Step 3 — App shell: skip link, header nav, draft-atlas strip, mobile bottom bar (≥ 44 px targets), visible focus
- [x] Step 4 — `src/core/graph/navigation.ts`: breadcrumbs, "Appears in", "Referenced by", with tests
- [x] Step 5 — Entity routes generated from content (`src/core/urls.ts`, `routes.ts`); route shells write `robots`
      (41 entity pages noindex); interim entity page; smoke test renders every route with `react-dom/server`
- [ ] Push and verify deploy (including a nested refresh) — owner review
- [ ] Step 6 — Region and system hubs
- [ ] Step 7 — Category-specific structure pages → push and verify — owner review
- [ ] Step 8 — Status badge (keyboard-operable details) and `/about/content-status`
- [ ] Step 9 — Desktop (1280 px) and narrow (500 px) screenshots, light and dark — owner review

