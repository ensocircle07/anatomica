import { PageMeta } from "../../app/PageMeta.tsx";

// Shows which build is live. Also serves as the nested route used to check
// that refreshing a deep link works on GitHub Pages (ADR-0006).
export function BuildInfoPage() {
  return (
    <section className="max-w-2xl space-y-4">
      <PageMeta path="/about/build" />
      <h1 className="text-3xl font-semibold">Build information</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="font-medium">Commit</dt>
        <dd>
          <code data-testid="build-commit">{__BUILD_COMMIT__}</code>
        </dd>
        <dt className="font-medium">Built at (UTC)</dt>
        <dd>
          <code>{__BUILD_TIME__}</code>
        </dd>
      </dl>
    </section>
  );
}
