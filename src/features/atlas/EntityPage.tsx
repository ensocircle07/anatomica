// Structure page frame: breadcrumbs, title block, category-specific main column, side panel
// (ADR-0012). Every page has exactly one <h1>; sections use <h2>, sub-parts <h3>.

import { isStub, type EntityId, type FullEntity } from "../../content/schema/index.ts";
import { entityPath } from "../../core/urls.ts";
import { breadcrumbs, referencedBy } from "../../core/graph/navigation.ts";
import { categoryLabel, humanise } from "../../core/labels.ts";
import { statusBadge } from "../../core/status.ts";
import { graph } from "../../app/atlas.ts";
import { PageMeta } from "../../app/PageMeta.tsx";
import { Breadcrumbs } from "../../components/Breadcrumbs.tsx";
import { List, Section } from "../../components/Section.tsx";
import { EntityLink } from "../../components/EntityLink.tsx";
import { SidePanel, Sources, Variations } from "./parts.tsx";
import {
  ArteryBody, BoneBody, CompartmentBody, ConditionBody, FeatureBody, MuscleBody, NerveBody, SpaceBody, VeinBody,
} from "./pages.tsx";

function Body({ e }: { e: FullEntity }) {
  switch (e.category) {
    case "muscle": return <MuscleBody e={e} />;
    case "nerve": return <NerveBody e={e} />;
    case "artery": return <ArteryBody e={e} />;
    case "vein": return <VeinBody e={e} />;
    case "bone": return <BoneBody e={e} />;
    case "bone-feature": return <FeatureBody e={e} />;
    case "space": return <SpaceBody e={e} />;
    case "compartment": return <CompartmentBody e={e} />;
    case "condition": return <ConditionBody e={e} />;
  }
}

/** Static status pill. Step 8 turns it into a keyboard-operable button with details. */
function StatusPill({ label, stub }: { label: string; stub: boolean }) {
  return (
    <p
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm " +
        (stub ? "border-stub-line bg-stub-bg text-stub-fg" : "border-draft-line bg-draft-bg text-draft-fg")
      }
    >
      <span aria-hidden>{stub ? "○" : "⚠"}</span>
      {label}
    </p>
  );
}

export function EntityPage({ id }: { id: EntityId }) {
  const entity = graph.byId.get(id);
  if (!entity) throw new Error(`EntityPage: no entity ${id}`);
  const stub = isStub(entity);

  return (
    <article className="space-y-8">
      <PageMeta path={entityPath(entity)} />
      <header className="space-y-3">
        <Breadcrumbs trail={breadcrumbs(graph, id)} />
        <h1 className="text-3xl font-semibold sm:text-4xl">{entity.name}</h1>
        <p className="text-fg-muted">
          {!stub && entity.latinName && (
            <>
              <i lang="la">{entity.latinName}</i> ·{" "}
            </>
          )}
          {categoryLabel(entity.category)}
          {!stub && ` · ${humanise(entity.level)} level`}
        </p>
        {!stub && entity.synonyms.length > 0 && (
          <p className="text-sm text-fg-muted">Also called: {entity.synonyms.join(", ")}</p>
        )}
        <StatusPill label={statusBadge(entity.meta)} stub={stub} />
        {!stub && <p className="max-w-3xl text-lg leading-relaxed">{entity.summary}</p>}
      </header>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-10">
          {stub ? (
            <>
              <p className="rounded-lg border border-stub-line bg-stub-bg p-4 text-stub-fg">
                This structure is referenced elsewhere in the atlas but has not been written yet.
              </p>
              <Section title="Referenced by">
                <List items={referencedBy(graph, id).map((l) => <EntityLink key={l.entityId} id={l.entityId!} />)} />
              </Section>
            </>
          ) : (
            <>
              <Body e={entity} />
              <Variations entity={entity} />
              <Sources entity={entity} />
            </>
          )}
        </div>
        <SidePanel entity={entity} />
      </div>
    </article>
  );
}
