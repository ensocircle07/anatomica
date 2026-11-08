// Breadcrumbs and the "Appears in" panel, derived from the graph (ADR-0012).
// Pure logic: no React, no DOM (ADR-0005).

import { isStub, type Entity, type EntityId } from "../../content/schema/index.ts";
import { regions, systems } from "../../content/taxonomy/index.ts";
import { entityPath, regionPath, systemPath } from "../urls.ts";
import type { Graph } from "./build.ts";

export interface NavLink {
  label: string;
  /** Omitted for the current page. */
  href?: string;
  /** True when the target is a stub ("not yet written"). */
  stub?: boolean;
}

const regionName = new Map<string, string>(regions.map((r) => [r.id, r.name]));
const systemName = new Map<string, string>(systems.map((s) => [s.id, s.name]));

function linkTo(entity: Entity): NavLink {
  return { label: entity.name, href: entityPath(entity), ...(isStub(entity) ? { stub: true } : {}) };
}

function regionLink(regionId: string): NavLink {
  return { label: regionName.get(regionId) ?? regionId, href: regionPath(regionId) };
}

function topRegion(entity: Entity): string | undefined {
  return entity.regions[0]?.split(".")[0];
}

/**
 * Structural parents, nearest first: the branch-of chain for nerves and arteries, the drains-into chain
 * for veins, the bone for a bone feature. Stops at a stub or a record without a parent.
 */
export function ancestors(graph: Graph, entity: Entity): Entity[] {
  const out: Entity[] = [];
  const seen = new Set<EntityId>([entity.id]);
  let current: Entity | undefined = entity;
  while (current && !isStub(current)) {
    let parentId: EntityId | undefined;
    if (current.category === "nerve" || current.category === "artery") parentId = current.origin.from;
    else if (current.category === "vein") parentId = current.drainsInto.into;
    else if (current.category === "bone-feature") parentId = current.bone;
    if (!parentId || seen.has(parentId)) break;
    seen.add(parentId);
    current = graph.byId.get(parentId);
    if (current) out.push(current);
  }
  return out;
}

/**
 * Canonical breadcrumb trail (ADR-0012): the system hub of the first system, then
 * - nerves, arteries, veins, bone features: their structural parents (outermost first);
 * - muscles: top-level region, then compartment;
 * - everything else: top-level region;
 * then the page itself (no href).
 */
export function breadcrumbs(graph: Graph, id: EntityId): NavLink[] {
  const entity = graph.byId.get(id);
  if (!entity) throw new Error(`no entity ${id}`);
  const trail: NavLink[] = [];
  const system = entity.systems[0];
  if (system) trail.push({ label: systemName.get(system) ?? system, href: systemPath(system) });

  const parents = ancestors(graph, entity);
  if (parents.length > 0) {
    trail.push(...parents.reverse().map(linkTo));
  } else {
    const region = topRegion(entity);
    if (region) trail.push(regionLink(region));
    if (!isStub(entity) && entity.category === "muscle" && entity.compartment) {
      const compartment = graph.byId.get(entity.compartment);
      if (compartment) trail.push(linkTo(compartment));
    }
  }
  trail.push({ label: entity.name });
  return trail;
}

export interface AppearsInGroup {
  title: string;
  links: NavLink[];
}

/** Every region, system, parent, space, compartment and condition the entity belongs to. Empty groups are omitted. */
export function appearsIn(graph: Graph, id: EntityId): AppearsInGroup[] {
  const entity = graph.byId.get(id);
  if (!entity) throw new Error(`no entity ${id}`);
  const get = (target: EntityId) => graph.byId.get(target);
  const links = (ids: Iterable<EntityId>) => [...new Set(ids)].flatMap((x) => { const e = get(x); return e ? [linkTo(e)] : []; });

  const parentTitle =
    entity.category === "vein" ? "Drains into" : entity.category === "bone-feature" ? "Part of" : "Branch of";

  const groups: AppearsInGroup[] = [
    { title: "Regions", links: entity.regions.map(regionLink) },
    { title: "Systems", links: entity.systems.map((s) => ({ label: systemName.get(s) ?? s, href: systemPath(s) })) },
    { title: parentTitle, links: ancestors(graph, entity).map(linkTo) },
    { title: "Passes through", links: links(graph.passesThrough.get(id) ?? []) },
    {
      title: "Compartment",
      links: !isStub(entity) && entity.category === "muscle" && entity.compartment ? links([entity.compartment]) : [],
    },
    { title: "Forms boundary of", links: links((graph.boundaryOf.get(id) ?? []).map((b) => b.space)) },
    { title: "Clinical conditions", links: links((graph.clinical.get(id) ?? []).map((c) => c.condition)) },
  ];
  return groups.filter((g) => g.links.length > 0);
}

/** Records that refer to this one in any stored relationship (used on stub pages). */
export function referencedBy(graph: Graph, id: EntityId): NavLink[] {
  const out: Entity[] = [];
  for (const e of graph.byId.values()) {
    if (e.id === id || isStub(e)) continue;
    if (JSON.stringify(e).includes(`"${id}"`) || JSON.stringify(e).includes(`[[${id}]]`)) out.push(e);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name)).map(linkTo);
}
