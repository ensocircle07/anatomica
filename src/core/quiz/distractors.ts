// Distractor check for generated questions (ARCHITECTURE §13).
// A wrong answer offered in a question must not actually be correct. For innervation questions this
// includes minor and variable supplies: e.g. the radial nerve supplies part of brachialis, so it may not
// be offered as a wrong answer to "Which nerve supplies brachialis?".
// Pure logic: no React, no DOM (ADR-0005).

import { isStub, type EntityId, type Innervation } from "../../content/schema/index.ts";
import type { Graph } from "../graph/build.ts";

export interface DistractorConflict {
  distractor: EntityId;
  contribution: Innervation["contribution"];
}

/** Every nerve that supplies the muscle, with the strongest stated contribution of each. */
export function nervesSupplying(graph: Graph, muscleId: EntityId): Map<EntityId, Innervation["contribution"]> {
  const out = new Map<EntityId, Innervation["contribution"]>();
  for (const [nerve, list] of graph.musclesSupplied) {
    const entry = list.find((m) => m.muscle === muscleId);
    if (entry) out.set(nerve, entry.contribution);
  }
  return out;
}

/** Proposed distractors that are in fact (partly) correct, and must be removed from the question. */
export function innervationDistractorConflicts(
  graph: Graph,
  muscleId: EntityId,
  distractors: readonly EntityId[],
): DistractorConflict[] {
  const muscle = graph.byId.get(muscleId);
  if (!muscle || isStub(muscle) || muscle.category !== "muscle") {
    throw new Error(`${muscleId} is not a full muscle record`);
  }
  const supplying = nervesSupplying(graph, muscleId);
  return distractors.flatMap((d) => {
    const contribution = supplying.get(d);
    return contribution ? [{ distractor: d, contribution }] : [];
  });
}
