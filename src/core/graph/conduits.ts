// Derivation of "passes through" / contents from conduit courses (ADR-0011 D3, amendment A).
// Pure logic: no React, no DOM (ADR-0005).

import type { Artery, Entity, EntityId, Nerve, Vein } from "../../content/schema/index.ts";
import { isStub } from "../../content/schema/index.ts";

export type ConduitEntity = Nerve | Artery | Vein;

export function isConduit(entity: Entity): entity is ConduitEntity {
  return !isStub(entity) && (entity.category === "nerve" || entity.category === "artery" || entity.category === "vein");
}

/**
 * For every structure named in some conduit's `course[].through`, the conduits that pass through it,
 * in the order they are first encountered. Keys are the space / compartment / feature IDs.
 */
export function deriveContents(entities: readonly Entity[]): Map<EntityId, EntityId[]> {
  const contents = new Map<EntityId, EntityId[]>();
  for (const entity of entities) {
    if (!isConduit(entity)) continue;
    for (const segment of entity.course) {
      if (!segment.through) continue;
      const list = contents.get(segment.through) ?? [];
      if (!list.includes(entity.id)) list.push(entity.id);
      contents.set(segment.through, list);
    }
  }
  return contents;
}
