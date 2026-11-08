import { Link } from "react-router";
import { site } from "../../content/site.ts";
import { entities } from "../../content/index.ts";
import { isStub } from "../../content/schema/index.ts";
import { entityPath } from "../../core/urls.ts";
import { PageMeta } from "../../app/PageMeta.tsx";

// Interim home page (Milestone 4, step 5): lists the seed structures so every generated
// page can be reached and reviewed. Step 6 replaces the list with region and system hubs.
export function HomePage() {
  const written = entities.filter((e) => !isStub(e)).sort((a, b) => a.name.localeCompare(b.name));
  const stubs = entities.filter(isStub).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-10">
      <PageMeta path="/" />

      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">{site.subtitle}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="max-w-2xl text-lg text-fg-muted">{site.tagline}</p>
      </section>

      <section aria-labelledby="seed-heading" className="space-y-3">
        <h2 id="seed-heading" className="text-xl font-semibold">
          Seed structures
        </h2>
        <p className="text-sm text-fg-muted">
          The first {written.length} written records, from the arm. Region and system hubs replace this list soon.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {written.map((e) => (
            <li key={e.id}>
              <Link
                to={entityPath(e)}
                className="flex min-h-11 items-center justify-between rounded border border-line bg-surface-raised px-3 py-2 hover:border-brand"
              >
                <span>{e.name}</span>
                <span className="text-xs text-fg-muted">{e.category.replace("-", " ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stubs-heading" className="space-y-3">
        <h2 id="stubs-heading" className="text-xl font-semibold">
          Referenced, not yet written
        </h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {stubs.map((e) => (
            <li key={e.id}>
              <Link
                to={entityPath(e)}
                className="inline-flex min-h-11 items-center rounded border border-stub-line bg-stub-bg px-3 text-stub-fg"
              >
                {e.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
