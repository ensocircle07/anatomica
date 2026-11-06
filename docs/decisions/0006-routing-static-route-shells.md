# ADR-0006: Clean URLs with a generated index.html per route

- **Status:** Accepted
- **Date:** 2026-11-06

## Context
GitHub Pages has no server-side routing. Refreshing or directly opening `/anatomica/nerves/median-nerve` returns 404 for a single-page app. Options considered:

1. Hash URLs (`/#/nerves/median-nerve`): work everywhere but are unattractive and poorly indexed.
2. The `404.html` redirect trick: works, but serves pages with HTTP 404 status, which hurts search indexing.
3. Generate a real `index.html` for every route at build time.

## Decision
Option 3. A post-build script copies the app shell to `dist/<route>/index.html` for every route, injecting a route-specific `<title>` and meta description. React Router uses clean URLs with `basename="/anatomica/"`.

## Consequences
- Direct links and refreshes return HTTP 200 and are indexable.
- Thousands of small HTML files in the build, well within GitHub Pages limits.
- The route list is generated from content, so new entities are automatically routable.
- Full prerendering of page content can be added later without changing URLs.
