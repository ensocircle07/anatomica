# ADR-0005: Single-record knowledge graph and technology stack

- **Status:** Accepted
- **Date:** 2026-11-06

## Context
Every structure must be reachable from many regions, systems, spaces, diagrams and clinical topics without maintaining duplicate copies.

## Decision
- Each structure is **one typed record** with a stable, never-renamed ID (e.g. `nerve.median`).
- Each relationship type has one canonical storage side; a build-time pipeline generates the inverse. Storing the same fact on both sides is a validation error.
- Content lives in TypeScript data files under `src/content/`; logic in `src/core/`. Neither imports React or DOM APIs (lint-enforced).
- A build-time pipeline validates content and builds the graph, search index, route list and coverage report. Validation failure blocks deployment.
- Stack: Vite, React, TypeScript (strict), React Router, Tailwind CSS v4, Lucide, MiniSearch, `idb-keyval`, Vitest; `vite-plugin-pwa` later. New dependencies require a stated reason.

## Consequences
- Relationships are navigable in both directions with no duplication.
- Content is reusable by search, diagrams, quizzes and a future mobile app.
- Authors must follow the schema; the validator gives immediate feedback.
