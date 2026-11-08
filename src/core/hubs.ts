// Region and system hubs (ARCHITECTURE §8), derived from each record's stored regions and systems.
// Pure logic: no React, no DOM (ADR-0005).

import { isStub, type Category, type Entity, type EntityId } from "../content/schema/index.ts";
import { regions, systems, type RegionId, type SystemId } from "../content/taxonomy/index.ts";
import { categoryLabel, categoryOrder } from "./labels.ts";
import { regionPath, systemPath } from "./urls.ts";
import type { Graph } from "./graph/build.ts";

export interface HubItem {
  id: EntityId;
  name: string;
  stub: boolean;
}

export interface HubGroup {
  /** e.g. "Muscles" or "Muscles — Posterior compartment of arm". */
  title: string;
  category: Category;
  items: HubItem[];
}

export interface HubSummary {
  written: number;
  notYetWritten: number;
}

function toItem(e: Entity): HubItem {
  return { id: e.id, name: e.name, stub: isStub(e) };
}

/** Groups records by category (in hub order); muscles are further grouped by compartment. Written records first. */
export function groupForHub(graph: Graph, list: readonly Entity[]): HubGroup[] {
  const byCategory = new Map<Category, Entity[]>();
  for (const e of list) byCategory.set(e.category, [...(byCategory.get(e.category) ?? []), e]);

  const sortItems = (items: Entity[]) =>
    [...items].sort((a, b) => Number(isStub(a)) - Number(isStub(b)) || a.name.localeCompare(b.name)).map(toItem);

  const groups: HubGroup[] = [];
  for (const category of [...byCategory.keys()].sort((a, b) => categoryOrder(a) - categoryOrder(b))) {
    const items = byCategory.get(category)!;
    if (category !== "muscle") {
      groups.push({ title: categoryLabel(category, 2), category, items: sortItems(items) });
      continue;
    }
    const byCompartment = new Map<string, Entity[]>();
    for (const m of items) {
      const compartment = !isStub(m) && m.category === "muscle" ? m.compartment : undefined;
      const name = compartment ? graph.byId.get(compartment)?.name ?? compartment : "";
      byCompartment.set(name, [...(byCompartment.get(name) ?? []), m]);
    }
    for (const name of [...byCompartment.keys()].sort((a, b) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)))) {
      groups.push({
        title: name ? `Muscles — ${name}` : "Muscles — compartment not yet recorded",
        category,
        items: sortItems(byCompartment.get(name)!),
      });
    }
  }
  return groups;
}

export function summarise(list: readonly Entity[]): HubSummary {
  const notYetWritten = list.filter(isStub).length;
  return { written: list.length - notYetWritten, notYetWritten };
}

/** Records in a region or any of its subregions. */
export function inRegion(list: readonly Entity[], regionId: RegionId): Entity[] {
  return list.filter((e) => e.regions.some((r) => r === regionId || r.startsWith(regionId + ".")));
}

export function inSystem(list: readonly Entity[], systemId: SystemId): Entity[] {
  return list.filter((e) => e.systems.includes(systemId));
}

export const topRegions = regions.filter((r) => !r.id.includes("."));

export function subregionsOf(regionId: RegionId) {
  return regions.filter((r) => r.id.startsWith(regionId + ".") && !r.id.slice(regionId.length + 1).includes("."));
}

export function parentRegion(regionId: RegionId) {
  const i = regionId.lastIndexOf(".");
  return i < 0 ? undefined : regions.find((r) => r.id === regionId.slice(0, i));
}

export interface HubRoute {
  path: string;
  title: string;
  description: string;
}

export function hubRoutes(): HubRoute[] {
  return [
    { path: "/regions", title: "Regional anatomy", description: "Browse the atlas by body region." },
    ...regions.map((r) => ({
      path: regionPath(r.id),
      title: r.name,
      description: `${r.name}: bones, muscles, nerves, vessels, spaces and clinical topics in ANATOMICA.`,
    })),
    { path: "/systems", title: "Systematic anatomy", description: "Browse the atlas by body system." },
    ...systems.map((s) => ({
      path: systemPath(s.id),
      title: s.name,
      description: `${s.name} in ANATOMICA.`,
    })),
  ];
}
