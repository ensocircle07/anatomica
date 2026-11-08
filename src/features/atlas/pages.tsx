// Category-specific main columns for structure pages (ADR-0012; plan approved 2026-11-08).
// Fields marked "derived" come from the graph, never from the record itself.

import type {
  Artery, Bone, BoneFeature, Compartment, Condition, Muscle, Nerve, Space, Vein,
} from "../../content/schema/index.ts";
import { isStub } from "../../content/schema/index.ts";
import { antagonists, synergists } from "../../core/graph/queries.ts";
import { formatRoots, humanise } from "../../core/labels.ts";
import { graph } from "../../app/atlas.ts";
import { EntityLink } from "../../components/EntityLink.tsx";
import { Prose } from "../../components/Prose.tsx";
import { Facts, List, Section, Tag } from "../../components/Section.tsx";
import { CourseTimeline, LesionExplorer, ProseSection, headsText, name } from "./parts.tsx";

function Attachments({ list }: { list: Muscle["origin"] }) {
  return (
    <List
      items={list.map((a, i) => (
        <span key={i}>
          <EntityLink id={a.site} />
          {a.detail && <span className="text-fg-muted"> — <Prose text={a.detail} inline /></span>}
        </span>
      ))}
    />
  );
}

// ── Muscle ──────────────────────────────────────────

export function MuscleBody({ e }: { e: Muscle }) {
  const syn = synergists(graph, e.id);
  const ant = antagonists(graph, e.id);
  const origin = e.heads?.length ? (
    <ul className="space-y-2">
      {e.heads.map((h) => (
        <li key={h.key}>
          <span className="font-medium">{h.name}: </span>
          <Attachments list={h.origin} />
        </li>
      ))}
    </ul>
  ) : (
    <Attachments list={e.origin} />
  );

  return (
    <>
      <Section title="Quick facts">
        <Facts
          rows={[
            ...(e.compartment ? [["Compartment", <EntityLink id={e.compartment} />] as [string, React.ReactNode]] : []),
            ["Origin", origin],
            ["Insertion", <Attachments list={e.insertion} />],
            [
              "Nerve supply",
              <List
                items={e.innervation.map((n, i) => (
                  <span key={i}>
                    <EntityLink id={n.nerve} />
                    {n.roots ? ` · ${formatRoots(n.roots)}` : <span className="text-fg-muted"> · roots not yet recorded</span>}
                    {headsText(n.heads)} <Tag tone={n.contribution === "main" ? "strong" : "neutral"}>{n.contribution}</Tag>
                    {n.arisesIn && <span className="text-fg-muted"> — branch arises: {humanise(n.arisesIn)}</span>}
                    {n.note && <span className="block text-sm text-fg-muted"><Prose text={n.note} inline /></span>}
                  </span>
                ))}
              />,
            ],
            [
              "Blood supply",
              <List
                items={e.bloodSupply.map((b, i) => (
                  <span key={i}>
                    <EntityLink id={b.artery} />
                    {headsText(b.heads)}
                    {b.contribution && <> <Tag tone={b.contribution === "main" ? "strong" : "neutral"}>{b.contribution}</Tag></>}
                  </span>
                ))}
              />,
            ],
            [
              "Actions",
              <List
                items={e.actions.map((a, i) => (
                  <span key={i}>
                    {humanise(a.movement)} at the <EntityLink id={a.joint} />
                    {headsText(a.heads)} <Tag>{a.role}</Tag>
                  </span>
                ))}
              />,
            ],
            ["Depth", humanise(e.depth) + (e.layer ? ` · ${e.layer}` : "")],
          ]}
        />
      </Section>
      <ProseSection title="Overview" text={e.sections.overview} />
      <Section title="Working with other muscles" note="Derived by comparing the recorded actions of written muscles.">
        <Facts
          rows={[
            ["Synergists", <List empty="None among the muscles written so far." items={syn.map((s) => <span key={s.muscle + s.movement}><EntityLink id={s.muscle} /> — {s.movement} at the {name(s.joint).toLowerCase()}</span>)} />],
            ["Antagonists", <List empty="None among the muscles written so far." items={ant.map((s) => <span key={s.muscle + s.movement}><EntityLink id={s.muscle} /> — {s.movement} at the {name(s.joint).toLowerCase()}</span>)} />],
          ]}
        />
      </Section>
      <ProseSection title="Palpation" text={e.palpation} />
      <ProseSection title="Relations" text={e.sections.relations} />
      <ProseSection title="Clinical notes" text={e.sections.clinical} />
    </>
  );
}

// ── Nerve ───────────────────────────────────────────

export function NerveBody({ e }: { e: Nerve }) {
  const branches = graph.branches.get(e.id) ?? [];
  const supplied = graph.musclesSupplied.get(e.id) ?? [];
  return (
    <>
      <Section title="Quick facts">
        <Facts
          rows={[
            ["Roots", formatRoots(e.roots)],
            [
              "Origin",
              <span>
                {e.origin.terminal ? "Terminal branch of the " : "Branch of the "}
                <EntityLink id={e.origin.from} />
                {e.origin.note && <span className="text-fg-muted"> — <Prose text={e.origin.note} inline /></span>}
              </span>,
            ],
            ["Type", humanise(e.modality) + (e.fibres?.length ? ` (${e.fibres.join(", ")} fibres)` : "")],
            ["Sensory territory", e.sensory ? <Prose text={e.sensory.territory} inline /> : <span className="text-fg-muted">Not recorded yet.</span>],
          ]}
        />
      </Section>
      <ProseSection title="Overview" text={e.sections.overview} />
      <Section title="Course" note="Proximal to distal.">
        <CourseTimeline conduit={e} />
      </Section>
      <Section title="Muscles supplied" note="Derived from each muscle's recorded nerve supply.">
        <List
          empty="No muscles written yet."
          items={supplied.map((m) => (
            <span key={m.muscle}>
              <EntityLink id={m.muscle} />
              {headsText(m.heads)} <Tag tone={m.contribution === "main" ? "strong" : "neutral"}>{m.contribution}</Tag>
            </span>
          ))}
        />
      </Section>
      <Section title="Branches" note="Derived from branch records; most branches are not yet written.">
        <List
          empty="No branch records yet."
          items={branches.map((b) => (
            <span key={b.child}>
              <EntityLink id={b.child} />
              {b.terminal && <> <Tag>terminal</Tag></>}
            </span>
          ))}
        />
      </Section>
      <Section title="If injured at…" note="Which muscles lose their supply depends on where the nerve is damaged.">
        <LesionExplorer
          nerveId={e.id}
          segments={e.course.map((s) => ({ key: s.key, label: s.through ? name(s.through) : humanise(s.key) }))}
        />
      </Section>
      <ProseSection title="Relations" text={e.sections.relations} />
      <ProseSection title="Clinical notes" text={e.sections.clinical} />
    </>
  );
}

// ── Artery and vein ─────────────────────────────────

export function ArteryBody({ e }: { e: Artery }) {
  const branches = graph.branches.get(e.id) ?? [];
  const supplies = graph.supplies.get(e.id) ?? [];
  return (
    <>
      <Section title="Quick facts">
        <Facts
          rows={[
            [
              "Origin",
              <span>
                Branch of the <EntityLink id={e.origin.from} />
                {e.origin.note && <span className="text-fg-muted"> — <Prose text={e.origin.note} inline /></span>}
              </span>,
            ],
            ["Territory", <Prose text={e.territory} inline />],
            ...(e.continuesAs ? [["Continues as", <EntityLink id={e.continuesAs} />] as [string, React.ReactNode]] : []),
            ...(e.pulsePoint ? [["Pulse point", <EntityLink id={e.pulsePoint} />] as [string, React.ReactNode]] : []),
          ]}
        />
      </Section>
      <ProseSection title="Overview" text={e.sections.overview} />
      <Section title="Course" note="Proximal to distal.">
        <CourseTimeline conduit={e} />
      </Section>
      <Section title="Muscles supplied" note="Derived from each muscle's recorded blood supply.">
        <List
          empty="No muscles written yet."
          items={supplies.map((s) => (
            <span key={s.muscle}>
              <EntityLink id={s.muscle} />
              {headsText(s.heads)}
              {s.contribution && <> <Tag tone={s.contribution === "main" ? "strong" : "neutral"}>{s.contribution}</Tag></>}
            </span>
          ))}
        />
      </Section>
      <Section title="Branches">
        <List empty="No branch records yet." items={branches.map((b) => <EntityLink key={b.child} id={b.child} />)} />
      </Section>
      <Section title="Anastomoses">
        <List
          items={e.anastomoses.map((a, i) => (
            <span key={i}>
              {a.name && <span className="font-medium">{a.name}: </span>}
              {a.with.map((w, j) => <span key={w}>{j > 0 && ", "}<EntityLink id={w} /></span>)}
              {a.clinical && <span className="block text-sm text-fg-muted"><Prose text={a.clinical} inline /></span>}
            </span>
          ))}
        />
      </Section>
      <ProseSection title="Relations" text={e.sections.relations} />
      <ProseSection title="Clinical notes" text={e.sections.clinical} />
    </>
  );
}

export function VeinBody({ e }: { e: Vein }) {
  const tributaries = graph.branches.get(e.id) ?? [];
  return (
    <>
      <Section title="Quick facts">
        <Facts
          rows={[
            ["Drains into", <EntityLink id={e.drainsInto.into} />],
            ["System", humanise(e.system)],
            ...(e.valves ? [["Valves", <Prose text={e.valves} inline />] as [string, React.ReactNode]] : []),
          ]}
        />
      </Section>
      <Section title="Course" note="Proximal to distal.">
        <CourseTimeline conduit={e} />
      </Section>
      <Section title="Tributaries">
        <List empty="No tributary records yet." items={tributaries.map((t) => <EntityLink key={t.child} id={t.child} />)} />
      </Section>
      <ProseSection title="Clinical notes" text={e.sections.clinical} />
    </>
  );
}

// ── Bone and bone feature ───────────────────────────

function attachmentRows(siteId: string) {
  return (graph.attachments.get(siteId) ?? []).map((a, i) => (
    <span key={i}>
      <EntityLink id={a.muscle} />
      {a.head && ` (${a.head} head)`} <Tag>{a.kind}</Tag>
      {a.detail && <span className="text-fg-muted"> — <Prose text={a.detail} inline /></span>}
    </span>
  ));
}

export function BoneBody({ e }: { e: Bone }) {
  const features = graph.features.get(e.id) ?? [];
  const partOf = (id: string) => {
    const f = graph.byId.get(id);
    return f && !isStub(f) && f.category === "bone-feature" ? f.part : "";
  };
  const allAttachmentSites = [e.id, ...features].filter((id) => (graph.attachments.get(id) ?? []).length > 0);

  return (
    <>
      <Section title="Quick facts">
        <Facts rows={[["Type", `${humanise(e.classification)} bone`], ["Parts", e.partsLayout.map((p) => p.name).join(" · ")]]} />
      </Section>
      <ProseSection title="Overview" text={e.sections.overview} />
      <Section title="Features" note="Features written so far, grouped by part.">
        <div className="space-y-4">
          {e.partsLayout.map((part) => {
            const list = features.filter((f) => partOf(f) === part.key);
            return (
              <div key={part.key}>
                <h3 className="font-semibold">{part.name}</h3>
                <List empty="No features written yet." items={list.map((f) => <EntityLink key={f} id={f} />)} />
              </div>
            );
          })}
        </div>
      </Section>
      <ProseSection title="Side identification" text={e.sideIdentification} />
      <Section title="Muscle attachments" note="Derived from each muscle's recorded origin and insertion.">
        {allAttachmentSites.length === 0 ? (
          <p className="text-sm text-fg-muted">None recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {allAttachmentSites.map((site) => (
              <div key={site}>
                <h3 className="font-semibold"><EntityLink id={site} /></h3>
                <List items={attachmentRows(site)} />
              </div>
            ))}
          </div>
        )}
      </Section>
      {e.ossification && (
        <Section title="Ossification">
          <List
            items={e.ossification.centres.map((c, i) => (
              <span key={i}>
                {c.site}
                {(c.appears || c.fuses) && (
                  <span className="text-fg-muted"> — {[c.appears && `appears: ${c.appears}`, c.fuses && `fuses: ${c.fuses}`].filter(Boolean).join("; ")}</span>
                )}
              </span>
            ))}
          />
          {e.ossification.notes && <p className="text-sm text-fg-muted"><Prose text={e.ossification.notes} inline /></p>}
        </Section>
      )}
      <ProseSection title="Radiology" text={e.radiology} />
      <ProseSection title="Clinical notes" text={e.sections.clinical} />
    </>
  );
}

export function FeatureBody({ e }: { e: BoneFeature }) {
  const bone = graph.byId.get(e.bone);
  const partName = bone && !isStub(bone) && bone.category === "bone" ? bone.partsLayout.find((p) => p.key === e.part)?.name : undefined;
  const transmits = graph.contents.get(e.id) ?? [];
  const bounds = graph.boundaryOf.get(e.id) ?? [];
  return (
    <>
      <Section title="Quick facts">
        <Facts
          rows={[
            ["Bone", <span><EntityLink id={e.bone} />{partName && ` · ${partName}`}</span>],
            ["Type", humanise(e.kind)],
            ...(e.palpability ? [["Palpable", humanise(e.palpability)] as [string, React.ReactNode]] : []),
          ]}
        />
      </Section>
      <ProseSection title="Overview" text={e.sections.overview} />
      <Section title="Muscle attachments" note="Derived from each muscle's recorded origin and insertion.">
        <List items={attachmentRows(e.id)} />
      </Section>
      <Section title="Structures it carries" note="Derived from the courses of nerves and vessels.">
        <List items={transmits.map((t) => <EntityLink key={t} id={t} />)} />
      </Section>
      {bounds.length > 0 && (
        <Section title="Forms boundary of">
          <List items={bounds.map((b) => <span key={b.space}><EntityLink id={b.space} /> ({b.side} boundary)</span>)} />
        </Section>
      )}
      <ProseSection title="Relations" text={e.sections.relations} />
      <ProseSection title="Clinical notes" text={e.sections.clinical} />
    </>
  );
}

// ── Space and compartment ───────────────────────────

export function SpaceBody({ e }: { e: Space }) {
  const derived = graph.contents.get(e.id) ?? [];
  const contents = e.contentsOrder ? e.contentsOrder.order : derived;
  return (
    <>
      <ProseSection title="Overview" text={e.sections.overview} />
      <Section title="Boundaries">
        <Facts
          rows={e.boundaries.map((b) => [
            humanise(b.side),
            <span>
              {b.formedBy.map((f, i) => <span key={f}>{i > 0 && ", "}<EntityLink id={f} /></span>)}
              {b.note && <span className="block text-sm text-fg-muted"><Prose text={b.note} inline /></span>}
            </span>,
          ])}
        />
      </Section>
      <Section
        title="Contents"
        note={`Derived from the courses of nerves and vessels${e.contentsOrder ? `; listed ${e.contentsOrder.axis}` : ""}.`}
      >
        <List items={contents.map((c) => <EntityLink key={c} id={c} />)} />
        {e.contentsMnemonic && (
          <p className="text-sm">
            <span className="font-medium">Mnemonic:</span> {e.contentsMnemonic.text}
            {e.contentsMnemonic.caveat && <span className="text-fg-muted"> — {e.contentsMnemonic.caveat}</span>}
          </p>
        )}
      </Section>
      <Section title="Communications">
        <List items={e.communications.map((c, i) => <span key={i}><EntityLink id={c.space} /> — <Prose text={c.via} inline /></span>)} />
      </Section>
      <ProseSection title="Clinical notes" text={e.sections.clinical} />
    </>
  );
}

export function CompartmentBody({ e }: { e: Compartment }) {
  const muscles = graph.compartmentMuscles.get(e.id) ?? [];
  const passing = graph.contents.get(e.id) ?? [];
  return (
    <>
      <ProseSection title="Boundaries" text={e.boundaries} />
      <Section title="Muscles" note="Derived from each muscle's recorded compartment.">
        <List items={muscles.map((m) => <EntityLink key={m} id={m} />)} />
      </Section>
      <Section title="Nerves and vessels passing through" note="Derived from the courses of nerves and vessels.">
        <List items={passing.map((p) => <EntityLink key={p} id={p} />)} />
      </Section>
      <ProseSection title="Clinical notes" text={e.sections.clinical} />
    </>
  );
}

// ── Clinical condition ──────────────────────────────

export function ConditionBody({ e }: { e: Condition }) {
  const roles = [...new Set(e.involves.map((i) => i.role))];
  return (
    <>
      <section aria-labelledby="mechanism-heading" className="space-y-2 rounded-lg border-l-4 border-brand bg-surface-raised p-4">
        <h2 id="mechanism-heading" className="text-xl font-semibold">Why it happens</h2>
        <Prose text={e.mechanism} />
      </section>
      <Section title="Structures involved">
        <Facts
          rows={roles.map((role) => [
            humanise(role),
            <span>{e.involves.filter((i) => i.role === role).map((i, k) => <span key={i.structure}>{k > 0 && ", "}<EntityLink id={i.structure} /></span>)}</span>,
          ])}
        />
      </Section>
      <ProseSection title="Presentation" text={e.presentation} />
      {e.signs?.length ? (
        <Section title="Signs">
          <ul className="flex flex-wrap gap-2">
            {e.signs.map((s) => <li key={s}><Tag>{s}</Tag></li>)}
          </ul>
        </Section>
      ) : null}
      {e.examination?.length ? (
        <Section title="Examination">
          <List items={e.examination.map((x) => <EntityLink key={x} id={x} />)} />
        </Section>
      ) : null}
      <ProseSection title="Investigations" text={e.investigations} />
      {e.complications?.length ? (
        <Section title="Complications">
          <List
            items={e.complications.map((c, i) => (
              <span key={i}>
                <Prose text={c.text} inline /> <Tag>{c.frequency === "uncertain" ? "frequency uncertain" : c.frequency}</Tag>
              </span>
            ))}
          />
        </Section>
      ) : null}
      <ProseSection title="Procedures" text={e.procedural} />
      <p role="note" className="rounded border border-draft-line bg-draft-bg p-3 text-sm text-draft-fg">
        Educational anatomy, not medical advice. It does not replace assessment by a qualified professional.
      </p>
    </>
  );
}
