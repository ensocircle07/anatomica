# ADR-0004: Image licence policy and project licences

- **Status:** Accepted
- **Date:** 2026-11-06

## Context
Diagrams are central, and the project may later become an Android app. Images that are merely publicly visible are not necessarily reusable. NonCommercial licences would block any future paid or ad-supported app; NoDerivatives licences forbid adding labels or hotspots.

## Decision
**Third-party images**
- Accepted: public domain, CC0, CC BY, CC BY-SA.
- Rejected: any NC or ND licence, and anything with unclear terms.
- Never used: TeachMeAnatomy illustrations, copyrighted textbook images, Radiopaedia and StatPearls media (these may be cited only).
- Every asset is recorded in `src/content/assets/register.ts` (source, author, SPDX licence, licence URL, attribution text, modifications, date verified). The build fails for any unregistered image.
- Attribution is shown under each diagram and on a generated Credits page.

**Project licences**
- Code: **MIT**.
- Content (text, data, original diagrams): **CC BY-SA 4.0**.

## Consequences
- Some excellent resources cannot be used; original schematics fill the gaps.
- Derivatives of CC BY-SA images must themselves be CC BY-SA, which is compatible with the content licence.
