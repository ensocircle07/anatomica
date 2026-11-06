# ADR-0008: British English canonical; American spellings searchable

- **Status:** Accepted
- **Date:** 2026-11-06

## Decision
- Canonical names and prose use British English (oesophagus, haemorrhage, anaesthesia, paralyse, centre, fibre).
- American spellings are stored as synonyms or handled by search normalisation (esophagus, hemorrhage, anesthesia).
- Where two terms are both standard in anatomy (fibular/peroneal), the TA2-preferred term is canonical and the other is a synonym.

## Consequences
- A spelling normalisation map is maintained in `src/core/search/`.
