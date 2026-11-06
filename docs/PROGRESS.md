# Development progress

Roadmap: [`ARCHITECTURE.md` §19](ARCHITECTURE.md#19-development-roadmap). Each milestone ends with owner approval before the next begins.

| # | Milestone | Status | Approved |
|---|---|---|---|
| 1 | Architecture | ✅ Complete | 2026-11-06 |
| 2 | Foundation | 🔄 In progress | — |
| 3 | Content engine | ⏳ Not started | — |
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
- [x] Local Git repository and first commit
- [ ] GitHub repository `ensocircle07/anatomica` created
- [ ] GitHub Pages source set to "GitHub Actions"
- [ ] First deployment succeeds
- [ ] Live site verified: home page, nested route, refresh on nested route, unknown path, desktop and mobile

### Known issues

- A separate older npm (10.5.2) is installed in `%APPDATA%\npm` and takes precedence over the npm 11 bundled with Node 26 on this computer. It works, but local and CI npm versions differ. Fix: run `npm uninstall -g npm` once.
