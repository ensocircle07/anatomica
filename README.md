# ANATOMICA

**The Clinical Anatomy Atlas** — *Understand the structure. Understand the consequence.*

ANATOMICA is a free, open-source, interactive human anatomy atlas. Every anatomical structure is stored once and linked to its location, relations, vascular supply, innervation, function and clinical consequences. A separate **First Aid** section teaches practical emergency knowledge for everyone.

- **Live site:** https://ensocircle07.github.io/anatomica/
- **Status:** Milestone 2 (Foundation). No atlas content has been written yet. See [`docs/PROGRESS.md`](docs/PROGRESS.md).

> ANATOMICA is an educational resource under development. It is not medical advice and does not replace professional care or certified first-aid training.

---

## Documentation

| Document | What it covers |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | The approved architecture and roadmap |
| [`docs/decisions/`](docs/decisions/) | Each architectural decision and the reason for it |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Development progress tracker |
| [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) | How to write and check a content record |
| [`docs/CONTENT_STATUS.md`](docs/CONTENT_STATUS.md) | Generated report: what content exists and its review status |

---

## Running it on your computer

### Requirements

- **Node.js 26 LTS** or newer (the version is pinned in `.nvmrc`). Check with `node --version`.
- **Git**.

### First time

```powershell
git clone https://github.com/ensocircle07/anatomica.git
cd anatomica
npm install
```

### Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts a local development server. Open the address it prints (http://localhost:5173/anatomica/). Changes appear instantly. Stop with `Ctrl+C`. |
| `npm run verify` | Runs **every** check, exactly as GitHub does before deploying: typecheck, boundary check, content validation, coverage-report check, tests and build. Run this before every commit. |
| `npm run typecheck` | Checks the TypeScript types only. |
| `npm run check:boundaries` | Confirms `src/content` and `src/core` do not import React or UI code. |
| `npm run validate` | Checks every content record (missing references, wrong categories, unverified page numbers, status rules…). |
| `npm run coverage` | Regenerates `docs/CONTENT_STATUS.md`. Run it after changing content, then commit the file. |
| `npm test` | Runs the automated tests (Vitest). |
| `npm run build` | Builds the production site into `dist/`, including one page per route. |
| `npm run preview` | Serves the built `dist/` folder locally. |

---

## Deployment

Every push to the `main` branch runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on GitHub:

1. `npm ci` installs the exact dependency versions from `package-lock.json`.
2. Typecheck, boundary check, content validation, coverage-report check, tests and build run in turn. **If any of them fails, nothing is deployed.**
3. The `dist/` folder is published to GitHub Pages.

Progress is visible in the repository's **Actions** tab. The page `/about/build` on the live site shows the commit that is currently deployed.

**One-time setting** (already done once for this repository): *Settings → Pages → Build and deployment → Source: **GitHub Actions***.

### Why every route has its own `index.html`

GitHub Pages can only serve files that exist. A single-page app normally has just one `index.html`, so opening or refreshing a deep link such as `/anatomica/about/build` would return "404 Not Found". After building, `scripts/generate-route-shells.ts` writes a real `index.html` for every route, each with its own title and description. See [ADR-0006](docs/decisions/0006-routing-static-route-shells.md).

---

## Project structure

```text
anatomica/
├── .github/workflows/deploy.yml   Build, check and deploy to GitHub Pages
├── docs/                          Architecture, decisions, progress
├── scripts/
│   ├── check-boundaries.ts        Keeps content and core free of UI code
│   ├── validate-content.ts        `npm run validate`
│   ├── coverage-report.ts         `npm run coverage` → docs/CONTENT_STATUS.md
│   ├── generate-route-shells.ts   Writes one index.html per route after the build
│   └── route-shells.ts            Helpers used by the script above (tested)
├── src/
│   ├── content/                   PURE DATA — anatomy, first aid, site identity (no React)
│   ├── core/                      PURE LOGIC — routes, validator, graph, coverage; later search, quiz (no React)
│   ├── app/                       App shell: router, layout, page metadata, "not found" page
│   ├── features/                  Pages grouped by feature (home, about, …)
│   ├── styles/                    Tailwind CSS entry point and design tokens
│   ├── main.tsx                   Starts the React app
│   └── vite-env.d.ts              Type declarations for Vite and build information
├── tests/                         Automated tests
├── index.html                     HTML template used by Vite
├── vite.config.ts                 Vite settings (base path /anatomica/, plugins, tests)
├── tsconfig*.json                 TypeScript settings (see below)
├── .nvmrc                         Node.js version (26) used locally and on GitHub
├── LICENSE                        MIT (code)
└── LICENSE-CONTENT.md             CC BY-SA 4.0 (content)
```

### The content/core boundary

`src/content` and `src/core` must never depend on React or the browser, so that the same data and logic can later power search, quizzes and an Android app ([ADR-0005](docs/decisions/0005-knowledge-graph-and-stack.md)). Two checks enforce this:

- `tsconfig.core.json` compiles those folders **without** browser types, so using `window` or `document` there is an error.
- `npm run check:boundaries` fails if they import React, React Router, Lucide or any UI folder.

### TypeScript projects

| File | Covers |
|---|---|
| `tsconfig.core.json` | `src/content`, `src/core` — no browser, no React |
| `tsconfig.app.json` | The React app (rest of `src/`) |
| `tsconfig.node.json` | `vite.config.ts`, `scripts/`, `tests/` (run by Node.js) |
| `tsconfig.json` | Ties the three together for `npm run typecheck` |

---

## Technology

React 19 · React Router 8 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · Lucide icons · Vitest 5. Node.js 26 LTS.

## Licences

- **Code:** [MIT](LICENSE)
- **Content** (text, data, original diagrams, docs): [CC BY-SA 4.0](LICENSE-CONTENT.md)
- **Third-party images:** each keeps its own licence (public domain, CC0, CC BY or CC BY-SA only), listed in the asset register and on the Credits page.
