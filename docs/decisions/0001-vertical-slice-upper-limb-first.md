# ADR-0001: Build the upper limb as a full vertical slice first

- **Status:** Accepted
- **Date:** 2026-11-06

## Context
The original roadmap populated all anatomy (Phase 5) before diagrams (Phase 6) and learning (Phase 7), and suggested filling content system by system (all osteology, then all myology…). This conflicts with the goal of establishing a quality standard on one region first. System-by-system population also leaves topographical anatomy unbuildable: a space's boundaries and contents need bones, muscles, nerves and vessels to exist at the same time.

## Decision
- Build the content engine, atlas UI and search on ~10 seed entities.
- Then complete the **upper limb** end to end (content, diagrams, questions, clinical correlations, landmarks) in the order shoulder → arm → cubital fossa → forearm → hand.
- Pass a quality gate (owner review) before expanding.
- Expand **region by region**: lower limb → back → thorax → abdomen → pelvis and perineum → neck → head.

## Consequences
- Every relationship can be validated as content is added; no dangling cross-links.
- Systematic hubs (e.g. Myology) will be visibly partial until all regions are done; coverage reports make this explicit.
- The upper limb becomes the reference standard for all later regions.
