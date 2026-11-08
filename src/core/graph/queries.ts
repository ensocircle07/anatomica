// Questions answered from the graph (ARCHITECTURE §6 "Derived deficits", §20.3).
// Pure logic: no React, no DOM (ADR-0005).

import { isStub, type EntityId, type Movement, type Muscle, type Nerve } from "../../content/schema/index.ts";
import type { Graph } from "./build.ts";

// ── Lesion level ────────────────────────────────────

export type LesionOutcome =
  /** The branch arises distal to the lesion: supply is lost. */
  | "lost"
  /** The branch arises within the injured segment: it may or may not be affected. */
  | "possibly-affected"
  /** The branch arises proximal to the lesion. */
  | "spared"
  /** The data does not say where the branch arises. */
  | "unknown-level";

export interface LesionRow {
  muscle: EntityId;
  /** The nerve whose branch is described (the injured nerve or one of its distal branches). */
  via: EntityId;
  outcome: LesionOutcome;
  contribution: Muscle["innervation"][number]["contribution"];
  heads?: string[];
  /** Other nerves that also supply this muscle (they are not affected by this lesion). */
  otherSupply: EntityId[];
}

function getNerve(graph: Graph, id: EntityId): Nerve | undefined {
  const e = graph.byId.get(id);
  return e && !isStub(e) && e.category === "nerve" ? e : undefined;
}

function compareToLesion(nerve: Nerve, arisesIn: string | undefined, lesionIndex: number): LesionOutcome {
  if (arisesIn === undefined) return "unknown-level";
  const i = nerve.course.findIndex((s) => s.key === arisesIn);
  if (i < 0) return "unknown-level";
  return i < lesionIndex ? "spared" : i === lesionIndex ? "possibly-affected" : "lost";
}

const WORST: LesionOutcome[] = ["lost", "possibly-affected", "unknown-level", "spared"];

/**
 * Muscles affected by a lesion of `nerveId` at course segment `segmentKey`, branch by branch.
 * Distal nerve branches (stored with `origin.from` = this nerve) inherit the outcome of where they arise;
 * terminal branches with no stated segment are treated as arising distal to every segment.
 */
export function deficitsAtLesion(graph: Graph, nerveId: EntityId, segmentKey: string): LesionRow[] {
  const nerve = getNerve(graph, nerveId);
  if (!nerve) throw new Error(`${nerveId} is not a full nerve record`);
  const lesionIndex = nerve.course.findIndex((s) => s.key === segmentKey);
  if (lesionIndex < 0) throw new Error(`${nerveId} has no course segment "${segmentKey}"`);

  const rows: LesionRow[] = [];
  collect(nerve, (arisesIn) => compareToLesion(nerve, arisesIn, lesionIndex));
  return rows;

  function collect(current: Nerve, outcomeOf: (arisesIn: string | undefined) => LesionOutcome) {
    for (const supplied of graph.musclesSupplied.get(current.id) ?? []) {
      const muscle = graph.byId.get(supplied.muscle) as Muscle;
      const others = [...new Set(muscle.innervation.map((n) => n.nerve).filter((n) => n !== current.id))];
      for (const n of muscle.innervation.filter((x) => x.nerve === current.id)) {
        rows.push({
          muscle: muscle.id,
          via: current.id,
          outcome: outcomeOf(n.arisesIn),
          contribution: n.contribution,
          ...(n.heads ? { heads: n.heads } : {}),
          otherSupply: others,
        });
      }
    }
    for (const branch of graph.branches.get(current.id) ?? []) {
      const child = getNerve(graph, branch.child);
      if (!child) continue;
      const branchOutcome: LesionOutcome =
        branch.segment === undefined ? (branch.terminal ? "lost" : "unknown-level") : outcomeOf(branch.segment);
      // Everything supplied by the child shares the outcome of the point where the child arises.
      collect(child, () => branchOutcome);
    }
  }
}

/** One outcome per muscle: the worst outcome among its branches from the injured nerve. */
export function summariseLesion(rows: readonly LesionRow[]): Map<EntityId, LesionOutcome> {
  const out = new Map<EntityId, LesionOutcome>();
  for (const r of rows) {
    const current = out.get(r.muscle);
    if (!current || WORST.indexOf(r.outcome) < WORST.indexOf(current)) out.set(r.muscle, r.outcome);
  }
  return out;
}

// ── Synergists and antagonists ──────────────────────

const OPPOSITE: Partial<Record<Movement, Movement>> = {};
for (const [a, b] of [
  ["flexion", "extension"], ["abduction", "adduction"], ["medial-rotation", "lateral-rotation"],
  ["pronation", "supination"], ["radial-deviation", "ulnar-deviation"], ["elevation", "depression"],
  ["protraction", "retraction"], ["upward-rotation", "downward-rotation"], ["opposition", "reposition"],
  ["dorsiflexion", "plantarflexion"], ["inversion", "eversion"],
] as const) {
  OPPOSITE[a] = b;
  OPPOSITE[b] = a;
}

export interface MovementPartner {
  muscle: EntityId;
  joint: EntityId;
  movement: Movement;
}

/** Muscles producing the same movement at the same joint. */
export function synergists(graph: Graph, muscleId: EntityId): MovementPartner[] {
  return partners(graph, muscleId, (m) => m);
}

/** Muscles producing the opposite movement at the same joint. */
export function antagonists(graph: Graph, muscleId: EntityId): MovementPartner[] {
  return partners(graph, muscleId, (m) => OPPOSITE[m]);
}

function partners(graph: Graph, muscleId: EntityId, target: (m: Movement) => Movement | undefined): MovementPartner[] {
  const muscle = graph.byId.get(muscleId);
  if (!muscle || isStub(muscle) || muscle.category !== "muscle") return [];
  const out: MovementPartner[] = [];
  for (const action of muscle.actions) {
    const wanted = target(action.movement);
    if (!wanted) continue;
    for (const other of graph.jointActions.get(action.joint) ?? []) {
      if (other.muscle !== muscleId && other.movement === wanted &&
          !out.some((p) => p.muscle === other.muscle && p.joint === action.joint && p.movement === wanted)) {
        out.push({ muscle: other.muscle, joint: action.joint, movement: wanted });
      }
    }
  }
  return out;
}
