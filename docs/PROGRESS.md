# Development progress

Roadmap: [`ARCHITECTURE.md` §19](ARCHITECTURE.md#19-development-roadmap). Each milestone ends with owner approval before the next begins.

| # | Milestone | Status | Approved |
|---|---|---|---|
| 1 | Architecture | ✅ Complete | 2026-11-06 |
| 2 | Foundation | 🔄 In progress | — |
| 3 | Content engine | 🔄 In progress (awaiting owner review) | — |
| 4 | Atlas UI | ⏳ Not started | — |
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

## Milestone 3 — Content engine 🔄

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
- [ ] Owner spot-check of the AI-drafted seed content
- [ ] Push and confirm the deployment succeeds

### Notes

- An older global npm (10.5.2, in `C:\Users\42077\AppData\Roaming\npm\node_modules\npm`) takes precedence over the npm 11.20.0 bundled with Node 26 on this computer. It works with Node 26 and is **deliberately left in place** (owner's decision). Optional removal: `npm uninstall -g npm`, which removes only that npm copy and its `npm`/`npx` launchers; undo with `npm install -g npm@10.5.2`.
