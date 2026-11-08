import { Link } from "react-router";
import { entities } from "../../content/index.ts";
import { regions, systems, type RegionId, type SystemId } from "../../content/taxonomy/index.ts";
import {
  groupForHub, inRegion, inSystem, parentRegion, subregionsOf, summarise, topRegions, type HubGroup, type HubSummary,
} from "../../core/hubs.ts";
import { entityPath, regionPath, systemPath } from "../../core/urls.ts";
import { graph } from "../../app/atlas.ts";
import { PageMeta } from "../../app/PageMeta.tsx";
import { Breadcrumbs } from "../../components/Breadcrumbs.tsx";
import { Section } from "../../components/Section.tsx";

function Counts({ summary }: { summary: HubSummary }) {
  if (summary.written + summary.notYetWritten === 0) return <span className="text-fg-muted">Nothing yet</span>;
  return (
    <span className="text-fg-muted">
      {summary.written} written{summary.notYetWritten > 0 && ` · ${summary.notYetWritten} not yet written`}
    </span>
  );
}

function CardGrid({ cards }: { cards: { href: string; title: string; summary: HubSummary }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <li key={c.href}>
          <Link
            to={c.href}
            className="flex min-h-16 flex-col justify-center rounded-lg border border-line bg-surface-raised px-4 py-3 hover:border-brand"
          >
            <span className="font-medium">{c.title}</span>
            <span className="text-sm">
              <Counts summary={c.summary} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HubGroups({ groups }: { groups: HubGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-fg-muted">No structures have been added here yet. Regions are filled one at a time, starting with the upper limb.</p>;
  }
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <Section key={g.title} title={g.title}>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => {
              const entity = graph.byId.get(item.id)!;
              return (
                <li key={item.id}>
                  <Link
                    to={entityPath(entity)}
                    className={
                      "flex min-h-11 items-center justify-between gap-2 rounded border px-3 py-2 " +
                      (item.stub ? "border-stub-line bg-stub-bg text-stub-fg" : "border-line bg-surface-raised hover:border-brand")
                    }
                  >
                    <span>{item.name}</span>
                    {item.stub && <span className="shrink-0 text-xs">not yet written</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ))}
    </div>
  );
}

export function RegionsIndexPage() {
  return (
    <div className="space-y-6">
      <PageMeta path="/regions" />
      <h1 className="text-3xl font-semibold">Regional anatomy</h1>
      <p className="max-w-2xl text-fg-muted">
        Structures grouped by where they are in the body. Regions are written one at a time; the upper limb comes first.
      </p>
      <CardGrid
        cards={topRegions.map((r) => ({ href: regionPath(r.id), title: r.name, summary: summarise(inRegion(entities, r.id)) }))}
      />
    </div>
  );
}

export function RegionHubPage({ regionId }: { regionId: RegionId }) {
  const region = regions.find((r) => r.id === regionId)!;
  const parent = parentRegion(regionId);
  const list = inRegion(entities, regionId);
  const subs = subregionsOf(regionId);
  const trail = [
    { label: "Regions", href: "/regions" },
    ...(parent ? [{ label: parent.name, href: regionPath(parent.id) }] : []),
    { label: region.name },
  ];
  return (
    <div className="space-y-8">
      <PageMeta path={regionPath(regionId)} />
      <div className="space-y-2">
        <Breadcrumbs trail={trail} />
        <h1 className="text-3xl font-semibold">{region.name}</h1>
        <p className="text-sm">
          <Counts summary={summarise(list)} />
        </p>
      </div>
      {subs.length > 0 && (
        <Section title="Subregions">
          <CardGrid
            cards={subs.map((r) => ({ href: regionPath(r.id), title: r.name, summary: summarise(inRegion(entities, r.id)) }))}
          />
        </Section>
      )}
      <HubGroups groups={groupForHub(graph, list)} />
    </div>
  );
}

export function SystemsIndexPage() {
  return (
    <div className="space-y-6">
      <PageMeta path="/systems" />
      <h1 className="text-3xl font-semibold">Systematic anatomy</h1>
      <p className="max-w-2xl text-fg-muted">Structures grouped by body system.</p>
      <CardGrid
        cards={systems.map((s) => ({ href: systemPath(s.id), title: s.name, summary: summarise(inSystem(entities, s.id)) }))}
      />
    </div>
  );
}

export function SystemHubPage({ systemId }: { systemId: SystemId }) {
  const system = systems.find((s) => s.id === systemId)!;
  const list = inSystem(entities, systemId);
  return (
    <div className="space-y-8">
      <PageMeta path={systemPath(systemId)} />
      <div className="space-y-2">
        <Breadcrumbs trail={[{ label: "Systems", href: "/systems" }, { label: system.name }]} />
        <h1 className="text-3xl font-semibold">{system.name}</h1>
        <p className="text-sm">
          <Counts summary={summarise(list)} />
        </p>
      </div>
      <HubGroups groups={groupForHub(graph, list)} />
    </div>
  );
}
