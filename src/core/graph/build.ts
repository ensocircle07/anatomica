// Graph builder (ARCHITECTURE §2 step 3, §4 "Relationships", ADR-0011).
// Every relationship is stored once on its canonical side; this module generates the other side.
// Pure logic: no React, no DOM (ADR-0005).

import {
  isStub,
  type Entity,
  type EntityId,
  type FullEntity,
  type Innervation,
  type Movement,
  type Muscle,
} from "../../content/schema/index.ts";
import { deriveContents, isConduit } from "./conduits.ts";

export interface MuscleSupplied {
  muscle: EntityId;
  contribution: Innervation["contribution"];
  heads?: string[];
  /** Course segments where the branches arise, one per innervation record that states it. */
  arisesIn: string[];
  roots?: Innervation["roots"];
}

export interface Branch {
  child: EntityId;
  segment?: string;
  terminal: boolean;
}

export interface AttachmentRef {
  muscle: EntityId;
  kind: "origin" | "insertion";
  head?: string;
  detail?: string;
}

export interface ActionRef {
  muscle: EntityId;
  movement: Movement;
  role: Muscle["actions"][number]["role"];
  heads?: string[];
}

export interface Graph {
  byId: ReadonlyMap<EntityId, Entity>;
  /** nerve → muscles it supplies (from Muscle.innervation). */
  musclesSupplied: ReadonlyMap<EntityId, MuscleSupplied[]>;
  /** parent nerve / artery / plexus part → branches (from origin.from); vein → tributaries (from drainsInto). */
  branches: ReadonlyMap<EntityId, Branch[]>;
  /** bone → features, in the bone's partsLayout order (from BoneFeature.bone). */
  features: ReadonlyMap<EntityId, EntityId[]>;
  /** bone feature / bone / fascia → muscle attachments (from Muscle origin, heads, insertion). */
  attachments: ReadonlyMap<EntityId, AttachmentRef[]>;
  /** space / compartment / feature → conduits passing through (from course[].through). */
  contents: ReadonlyMap<EntityId, EntityId[]>;
  /** conduit → structures it passes through, proximal → distal. */
  passesThrough: ReadonlyMap<EntityId, EntityId[]>;
  /** structure → spaces it helps to bound (from Space.boundaries). */
  boundaryOf: ReadonlyMap<EntityId, { space: EntityId; side: string }[]>;
  /** artery → muscles it supplies (from Muscle.bloodSupply). */
  supplies: ReadonlyMap<EntityId, { muscle: EntityId; heads?: string[] }[]>;
  /** compartment → muscles (from Muscle.compartment). */
  compartmentMuscles: ReadonlyMap<EntityId, EntityId[]>;
  /** joint → muscles acting on it (from Muscle.actions). */
  jointActions: ReadonlyMap<EntityId, ActionRef[]>;
  /** structure → conditions involving it (from Condition.involves). */
  clinical: ReadonlyMap<EntityId, { condition: EntityId; role: string }[]>;
}

function push<V>(map: Map<EntityId, V[]>, key: EntityId, value: V) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

export function buildGraph(entities: readonly Entity[]): Graph {
  const byId = new Map(entities.map((e) => [e.id, e] as const));
  const musclesSupplied = new Map<EntityId, MuscleSupplied[]>();
  const branches = new Map<EntityId, Branch[]>();
  const features = new Map<EntityId, EntityId[]>();
  const attachments = new Map<EntityId, AttachmentRef[]>();
  const passesThrough = new Map<EntityId, EntityId[]>();
  const boundaryOf = new Map<EntityId, { space: EntityId; side: string }[]>();
  const supplies = new Map<EntityId, { muscle: EntityId; heads?: string[] }[]>();
  const compartmentMuscles = new Map<EntityId, EntityId[]>();
  const jointActions = new Map<EntityId, ActionRef[]>();
  const clinical = new Map<EntityId, { condition: EntityId; role: string }[]>();

  const full = entities.filter((e): e is FullEntity => !isStub(e));

  for (const e of full) {
    if (isConduit(e)) {
      const throughs = e.course.flatMap((s) => (s.through ? [s.through] : []));
      if (throughs.length > 0) passesThrough.set(e.id, throughs);
    }

    switch (e.category) {
      case "nerve":
      case "artery":
        push(branches, e.origin.from, {
          child: e.id,
          ...(e.origin.segment ? { segment: e.origin.segment } : {}),
          terminal: e.origin.terminal ?? false,
        });
        break;
      case "vein":
        push(branches, e.drainsInto.into, {
          child: e.id,
          ...(e.drainsInto.segment ? { segment: e.drainsInto.segment } : {}),
          terminal: false,
        });
        break;
      case "bone-feature":
        push(features, e.bone, e.id);
        break;
      case "muscle": {
        for (const n of e.innervation) {
          const list = musclesSupplied.get(n.nerve) ?? [];
          // One muscle can be supplied by several branches of the same nerve (e.g. triceps):
          // list it once, with the strongest contribution and merged heads and segments.
          const existing = list.find((m) => m.muscle === e.id);
          if (existing) {
            if (rank(n.contribution) > rank(existing.contribution)) existing.contribution = n.contribution;
            if (existing.heads && n.heads) existing.heads = [...new Set([...existing.heads, ...n.heads])];
            else delete existing.heads;
            if (n.arisesIn && !existing.arisesIn.includes(n.arisesIn)) existing.arisesIn.push(n.arisesIn);
          } else {
            list.push({
              muscle: e.id,
              contribution: n.contribution,
              ...(n.heads ? { heads: [...n.heads] } : {}),
              arisesIn: n.arisesIn ? [n.arisesIn] : [],
              ...(n.roots ? { roots: n.roots } : {}),
            });
          }
          musclesSupplied.set(n.nerve, list);
        }
        for (const h of e.heads ?? []) {
          for (const a of h.origin) push(attachments, a.site, { muscle: e.id, kind: "origin", head: h.key, ...(a.detail ? { detail: a.detail } : {}) });
        }
        for (const a of e.origin) push(attachments, a.site, { muscle: e.id, kind: "origin", ...(a.detail ? { detail: a.detail } : {}) });
        for (const a of e.insertion) push(attachments, a.site, { muscle: e.id, kind: "insertion", ...(a.detail ? { detail: a.detail } : {}) });
        for (const b of e.bloodSupply) push(supplies, b.artery, { muscle: e.id, ...(b.heads ? { heads: b.heads } : {}) });
        if (e.compartment) push(compartmentMuscles, e.compartment, e.id);
        for (const a of e.actions) {
          push(jointActions, a.joint, { muscle: e.id, movement: a.movement, role: a.role, ...(a.heads ? { heads: a.heads } : {}) });
        }
        break;
      }
      case "space":
        for (const b of e.boundaries) for (const f of b.formedBy) push(boundaryOf, f, { space: e.id, side: b.side });
        break;
      case "condition":
        for (const inv of e.involves) push(clinical, inv.structure, { condition: e.id, role: inv.role });
        break;
      default:
        break;
    }
  }

  // Order each bone's features by its partsLayout.
  for (const [boneId, list] of features) {
    const bone = byId.get(boneId);
    if (!bone || isStub(bone) || bone.category !== "bone") continue;
    const order = bone.partsLayout.map((p) => p.key);
    const partOf = (id: EntityId) => {
      const f = byId.get(id);
      return f && !isStub(f) && f.category === "bone-feature" ? order.indexOf(f.part) : -1;
    };
    list.sort((a, b) => partOf(a) - partOf(b));
  }

  return {
    byId, musclesSupplied, branches, features, attachments,
    contents: deriveContents(entities), passesThrough, boundaryOf, supplies,
    compartmentMuscles, jointActions, clinical,
  };
}

function rank(c: Innervation["contribution"]): number {
  return c === "main" ? 2 : c === "variable" ? 1 : 0;
}
