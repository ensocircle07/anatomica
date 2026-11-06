import { Link } from "react-router";
import { site } from "../../content/site.ts";
import { PageMeta } from "../../app/PageMeta.tsx";

export function AboutPage() {
  return (
    <section className="max-w-2xl space-y-4">
      <PageMeta path="/about" />
      <h1 className="text-3xl font-semibold">About {site.name}</h1>
      <p className="text-slate-700 dark:text-slate-300">
        {site.name} is a free, open-source clinical anatomy atlas. Every anatomical structure is stored once and linked
        to its location, relations, vascular supply, innervation, function and clinical consequences.
      </p>
      <p className="text-slate-700 dark:text-slate-300">
        Content is written and reviewed progressively. Each page will show its review status, so you can see what has
        and has not been checked by a qualified reviewer.
      </p>
      <p className="text-sm">
        <Link to="/about/build" className="text-brand-600 underline">
          Build information
        </Link>
      </p>
    </section>
  );
}
