# ADR-0009: Use Node.js 26 LTS

- **Status:** Accepted
- **Date:** 2026-11-06

## Context
The development machine had Node.js v25.5.0 installed. Odd-numbered Node releases are short-lived, and v25 is end-of-life. As of 2026-11-06 the current LTS line is **Node.js 26** (codename "Lithium"; latest release v26.13.0, per https://nodejs.org/dist/index.json).

## Decision
- Install Node.js 26 LTS before Phase 2.
- Pin it for the project (`.nvmrc` and the `engines` field in `package.json`) and use Node 26 in the GitHub Actions workflow.

## Consequences
- Local and CI builds use the same supported runtime.
