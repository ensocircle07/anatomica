// Building blocks shared by the structure pages (ADR-0012).

import { useState } from "react";
import { Link } from "react-router";
import { isStub, type Citation, type Entity, type EntityId, type FullEntity, type Position } from "../../content/schema/index.ts";
import { references } from "../../content/index.ts";
import type { ConduitEntity } from "../../core/graph/conduits.ts";
import { appearsIn, type NavLink } from "../../core/graph/navigation.ts";
import { deficitsAtLesion, type LesionOutcome } from "../../core/graph/queries.ts";
import { humanise } from "../../core/labels.ts";
import { graph } from "../../app/atlas.ts";
import { EntityLink } from "../../components/EntityLink.tsx";
import { Prose } from "../../components/Prose.tsx";
import { List, Section, Tag } from "../../components/Section.tsx";

export function name(id: EntityId): string {
  return graph.byId.get(id)?.name ?? id;
}

const POSITION_LABELS: Record<Position, string> = {
  anterior: "In front",
  posterior: "Behind",
  medial: "Medial",
  lateral: "Lateral",
  superior: "Above",
  inferior: "Below",
  superficial: "Superficial",
  deep: "Deep",
  accompanies: "Accompanied by",
  "crosses-anterior": "Crosses in front",
  "crosses-posterior": "Crosses behind",
  pierces: "Pierces",
  within: "Within",
};

/** Heads, e.g. "(long and medial heads)". */
export function headsText(heads?: string[]): string {
  if (!heads?.length) return "";
  const list = heads.length === 1 ? heads[0]! : `${heads.slice(0, -1).join(", ")} and ${heads.at(-1)}`;
  return ` (${list} head${heads.length > 1 ? "s" : ""})`;
}

// ── Course timeline (nerves, arteries, veins) ───────

export function CourseTimeline({ conduit }: { conduit: ConduitEntity }) {
  const branchesHere = (key: string) => (graph.branches.get(conduit.id) ?? []).filter((b) => b.segment === key);
  const muscleBranchesHere = (key: string) => {
    if (conduit.category !== "nerve") return [];
    return (graph.musclesSupplied.get(conduit.id) ?? []).flatMap((m) => {
      const muscle = graph.byId.get(m.muscle);
      if (!muscle || isStub(muscle) || muscle.category !== "muscle") return [];
      return muscle.innervation
        .filter((n) => n.nerve === conduit.id && n.arisesIn === key)
        .map((n) => ({ muscle: muscle.id, heads: n.heads, contribution: n.contribution }));
    });
  };

  return (
    <ol className="relative space-y-6 border-l-2 border-line pl-6">
      {conduit.course.map((segment, i) => {
        const branches = branchesHere(segment.key);
        const muscular = muscleBranchesHere(segment.key);
        return (
          <li key={segment.key} className="relative">
            <span
              aria-hidden
              className="absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand bg-surface"
            />
            <h3 className="font-semibold">
              <span className="sr-only">Step {i + 1}: </span>
              {segment.through ? name(segment.through) : humanise(segment.key)}
            </h3>
            <div className="mt-1 space-y-2">
              <Prose text={segment.text} />
              {segment.relations.length > 0 && (
                <ul className="space-y-0.5 text-sm">
                  {segment.relations.map((r, j) => (
                    <li key={j}>
                      <span className="text-fg-muted">{POSITION_LABELS[r.position]}:</span> <EntityLink id={r.structure} />
                      {r.note && <span className="text-fg-muted"> — {r.note}</span>}
                    </li>
                  ))}
                </ul>
              )}
              {(branches.length > 0 || muscular.length > 0) && (
                <p className="text-sm">
                  <span className="font-medium">Branches here: </span>
                  {[
                    ...branches.map((b) => <EntityLink key={b.child} id={b.child} />),
                    ...muscular.map((m) => (
                      <span key={m.muscle + (m.heads ?? []).join()}>
                        to <EntityLink id={m.muscle} />
                        {headsText(m.heads)}
                        {m.contribution !== "main" && <> <Tag>{m.contribution}</Tag></>}
                      </span>
                    )),
                  ].map((node, k) => (
                    <span key={k}>
                      {k > 0 && "; "}
                      {node}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ── Lesion explorer (nerves) ────────────────────────

const OUTCOMES: { outcome: LesionOutcome; title: string }[] = [
  { outcome: "lost", title: "Supply lost (branch arises below the injury)" },
  { outcome: "possibly-affected", title: "Possibly affected (branch arises at the level of the injury)" },
  { outcome: "spared", title: "Spared (branch arises above the injury)" },
  { outcome: "unknown-level", title: "Level of branch not recorded" },
];

export function LesionExplorer({ nerveId, segments }: { nerveId: EntityId; segments: { key: string; label: string }[] }) {
  const [segment, setSegment] = useState(segments[0]?.key ?? "");
  const selectId = `lesion-${nerveId}`;
  if (segments.length === 0) return null;
  const rows = deficitsAtLesion(graph, nerveId, segment);

  return (
    <div className="space-y-4 rounded-lg border border-line bg-surface-raised p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <label htmlFor={selectId} className="font-medium">
          Injury at
        </label>
        <select
          id={selectId}
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="min-h-11 rounded border border-line bg-surface px-2"
        >
          {segments.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div aria-live="polite" className="space-y-3">
        {OUTCOMES.map(({ outcome, title }) => {
          const matching = rows.filter((r) => r.outcome === outcome);
          if (matching.length === 0) return null;
          return (
            <div key={outcome}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-1 space-y-0.5 text-sm">
                {matching.map((r, i) => (
                  <li key={i}>
                    <EntityLink id={r.muscle} />
                    {headsText(r.heads)}
                    {r.contribution !== "main" && <> <Tag>{r.contribution} supply</Tag></>}
                    {r.otherSupply.length > 0 && (
                      <span className="text-fg-muted">
                        {" "}— also supplied by {r.otherSupply.map((o, j) => <span key={o}>{j > 0 && ", "}<EntityLink id={o} /></span>)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-fg-muted">No muscle supply recorded for this nerve yet.</p>}
      </div>
      <p className="text-xs text-fg-muted">
        Derived from the course data. Only muscles already written in ANATOMICA are listed, so this list is incomplete
        while the atlas is in draft.
      </p>
    </div>
  );
}

// ── Prose sections, variations, sources ─────────────

export function ProseSection({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <Section title={title}>
      <Prose text={text} />
    </Section>
  );
}

export function Variations({ entity }: { entity: FullEntity }) {
  if (!entity.variations?.length) return null;
  return (
    <Section title="Variations">
      <List
        items={entity.variations.map((v, i) => (
          <span key={i}>
            <Prose text={v.text} inline /> <Tag>{v.frequency === "uncertain" ? "frequency uncertain" : v.frequency}</Tag>
          </span>
        ))}
      />
    </Section>
  );
}

function allCitations(entity: FullEntity): Citation[] {
  const out: Citation[] = [...entity.citations];
  entity.variations?.forEach((v) => out.push(...v.citations));
  if (entity.category === "condition") entity.complications?.forEach((c) => out.push(...c.citations));
  if (entity.category === "bone" && entity.ossification) out.push(...entity.ossification.citations);
  return out;
}

export function Sources({ entity }: { entity: FullEntity }) {
  // For each reference, the specific fields it supports. A citation without `supports` backs the whole
  // record, in which case no field list is shown (it would wrongly suggest a narrower scope).
  const byRef = new Map<string, Set<string> | "whole-record">();
  for (const c of allCitations(entity)) {
    const current = byRef.get(c.refId) ?? new Set<string>();
    if (current === "whole-record") continue;
    if (!c.supports) byRef.set(c.refId, "whole-record");
    else byRef.set(c.refId, current.add(c.supports));
  }
  return (
    <Section title="Sources">
      <ul className="space-y-2 text-sm">
        {[...byRef].map(([refId, supports]) => {
          const ref = references.find((r) => r.id === refId);
          return (
            <li key={refId}>
              <span className="font-medium">{ref?.title ?? refId}</span>
              {ref?.edition && <>, {ref.edition} edition</>}
              {ref?.authors && <span className="text-fg-muted"> — {ref.authors.join(", ")}</span>}
              {supports !== "whole-record" && supports.size > 0 && (
                <span className="text-fg-muted"> (supports: {[...supports].join(", ")})</span>
              )}
              <span className="block text-xs text-fg-muted">
                Page or chapter not yet verified
                {ref && ref.unconfirmed.length > 0 && <> · bibliographic details unconfirmed ({ref.unconfirmed.join(", ")})</>}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-fg-muted">
        Sources are used to check facts; the wording is original. Last updated {entity.meta.updated}.
      </p>
    </Section>
  );
}

// ── Side panel ──────────────────────────────────────

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group rounded-lg border border-line bg-surface-raised">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <span aria-hidden className="text-fg-muted transition group-open:rotate-90">›</span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export function SidePanel({ entity }: { entity: Entity }) {
  const groups = appearsIn(graph, entity.id);
  const clinical = graph.clinical.get(entity.id) ?? [];
  return (
    <aside aria-label="Related" className="space-y-4">
      <Collapsible title="Appears in">
        <dl className="space-y-3 text-sm">
          {groups.map((g) => (
            <div key={g.title}>
              <dt className="font-medium text-fg-muted">{g.title}</dt>
              <dd>
                <ul>
                  {g.links.map((l) => (
                    <li key={l.href ?? l.label}>
                      <LinkOrText link={l} />
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Collapsible>
      {clinical.length > 0 && (
        <Collapsible title="Clinical significance">
          <ul className="space-y-1 text-sm">
            {clinical.map((c) => (
              <li key={c.condition}>
                <EntityLink id={c.condition} /> <Tag>{c.role.replaceAll("-", " ")}</Tag>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}
    </aside>
  );
}

function LinkOrText({ link }: { link: NavLink }) {
  if (!link.href) return <span>{link.label}</span>;
  return (
    <Link
      to={link.href}
      className={"inline-flex min-h-8 items-center underline-offset-2 hover:underline " + (link.stub ? "text-fg-muted" : "text-brand")}
    >
      {link.label}
      {link.stub && <span className="sr-only"> (not yet written)</span>}
    </Link>
  );
}
