import { isStub, type EntityId } from "../../content/schema/index.ts";
import { categorySections, entityPath } from "../../core/urls.ts";
import { breadcrumbs } from "../../core/graph/navigation.ts";
import { graph } from "../../app/atlas.ts";
import { PageMeta } from "../../app/PageMeta.tsx";
import { Breadcrumbs } from "../../components/Breadcrumbs.tsx";

// Step 5 placeholder: proves every generated route renders. Replaced by the
// category-specific structure pages in step 7.
export function EntityPage({ id }: { id: EntityId }) {
  const entity = graph.byId.get(id);
  if (!entity) throw new Error(`EntityPage: no entity ${id}`);
  const path = entityPath(entity);

  return (
    <article className="max-w-3xl space-y-4">
      <PageMeta path={path} />
      <Breadcrumbs trail={breadcrumbs(graph, id)} />
      <h1 className="text-3xl font-semibold">{entity.name}</h1>
      <p className="text-sm text-fg-muted">
        {entity.category.replace("-", " ")} · {categorySections[entity.category]}
      </p>
      {isStub(entity) ? (
        <p className="rounded border border-stub-line bg-stub-bg p-3 text-stub-fg">Not yet written.</p>
      ) : (
        <p className="text-lg">{entity.summary}</p>
      )}
    </article>
  );
}
