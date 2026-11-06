# ADR-0010: Content reviewer status

- **Status:** Accepted (pending owner confirmation)
- **Date:** 2026-11-06

## Context
The `fact-checked` and `clinically-reviewed` statuses (ADR-0003) require a qualified human. The owner's answer to this question arrived as an unfilled template ("no reviewer yet / I have one: …"), so it is recorded as **no reviewer yet** until confirmed.

## Decision
- Until a reviewer is involved, content can reach at most `cross-checked` (accuracy) and `drafted` (clinical).
- The site presents itself as a draft atlas, with status badges on every page.
- The upper-limb slice (ADR-0001) is the first target for review once a reviewer is available.

## Consequences
- No content will be shown as "Complete" without human review.
