# ADR-0003: Track content status in independent dimensions

- **Status:** Accepted
- **Date:** 2026-11-06

## Context
The specification proposed a single linear scale (Not started → … → Complete). The underlying work is not linear: a diagram can be finished before fact-checking, and clinical review is independent of diagram work.

## Decision
Each entity's `meta` records four independent dimensions:

| Dimension | Values |
|---|---|
| Writing | `not-started` · `in-progress` · `draft-complete` |
| Accuracy | `unchecked` · `cross-checked` · `fact-checked` |
| Clinical | `none` · `drafted` · `clinically-reviewed` |
| Diagram | `none` · `linked` · `complete` |

"Complete" is computed: true only when every dimension is at its final value (or explicitly not applicable).

- `fact-checked` and `clinically-reviewed` require a qualified human reviewer. The AI assistant may set at most `cross-checked` and `drafted`.
- Completeness is measured against manifests of structures that should exist, not against pages that exist.
- Every page displays its status badge to users.

## Consequences
- The generated `docs/CONTENT_STATUS.md` gives an honest view of progress.
- Users can see which content has not yet been expert-reviewed.
