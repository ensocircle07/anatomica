import { Link, useLocation } from "react-router";
import { PageMeta } from "./PageMeta.tsx";

export function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <section className="space-y-4">
      <PageMeta title="Page not found — ANATOMICA" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-slate-600 dark:text-slate-300">
        There is no page at <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{pathname}</code>.
      </p>
      <Link to="/" className="text-brand underline">
        Go to the home page
      </Link>
    </section>
  );
}
