import { Link } from "react-router";
import { isStub, type EntityId } from "../content/schema/index.ts";
import { entityPath } from "../core/urls.ts";
import { graph } from "../app/atlas.ts";

/** A link to an entity page. Stubs are muted and announce "not yet written" to screen readers. */
export function EntityLink({ id, children }: { id: EntityId; children?: React.ReactNode }) {
  const entity = graph.byId.get(id);
  if (!entity) return <span>{id}</span>;
  const stub = isStub(entity);
  return (
    <Link
      to={entityPath(entity)}
      className={
        "underline decoration-1 underline-offset-2 hover:decoration-2 " +
        (stub ? "text-fg-muted decoration-dotted" : "text-brand")
      }
    >
      {children ?? entity.name}
      {stub && <span className="sr-only"> (not yet written)</span>}
    </Link>
  );
}
