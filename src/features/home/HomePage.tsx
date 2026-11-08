import { Link } from "react-router";
import { Layers, Map, Stethoscope } from "lucide-react";
import { site } from "../../content/site.ts";
import { entities } from "../../content/index.ts";
import { inRegion, inSystem, summarise, topRegions } from "../../core/hubs.ts";
import { regionPath, systemPath } from "../../core/urls.ts";
import { PageMeta } from "../../app/PageMeta.tsx";
import { Section } from "../../components/Section.tsx";

export function HomePage() {
  const upperLimb = summarise(inRegion(entities, "upper-limb"));
  const clinical = summarise(inSystem(entities, "clinical"));

  return (
    <div className="space-y-12">
      <PageMeta path="/" />

      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">{site.subtitle}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="max-w-2xl text-lg text-fg-muted">{site.tagline}</p>
      </section>

      <ul className="grid gap-4 md:grid-cols-3">
        {[
          { to: "/regions", Icon: Map, title: "Regional anatomy", text: "Browse by body region, from the upper limb outwards." },
          { to: "/systems", Icon: Layers, title: "Systematic anatomy", text: "Bones, joints, muscles, nerves, vessels and spaces." },
          { to: systemPath("clinical"), Icon: Stethoscope, title: "Clinical anatomy", text: `Conditions explained by the anatomy behind them (${clinical.written} so far).` },
        ].map(({ to, Icon, title, text }) => (
          <li key={to}>
            <Link to={to} className="flex h-full flex-col gap-2 rounded-lg border border-line bg-surface-raised p-5 hover:border-brand">
              <Icon aria-hidden className="h-6 w-6 text-brand" />
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-sm text-fg-muted">{text}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Section title="Where the atlas is now">
        <p className="max-w-2xl text-fg-muted">
          The atlas is written region by region, starting with the upper limb. It currently holds {upperLimb.written} written
          upper-limb records, mostly from the arm, with {upperLimb.notYetWritten} more referenced but not yet written. Every page
          shows its review status.
        </p>
        <ul className="flex flex-wrap gap-2">
          {topRegions.map((r) => {
            const s = summarise(inRegion(entities, r.id));
            return (
              <li key={r.id}>
                <Link
                  to={regionPath(r.id)}
                  className={
                    "inline-flex min-h-11 items-center rounded-full border px-4 text-sm " +
                    (s.written > 0 ? "border-brand text-brand" : "border-line text-fg-muted")
                  }
                >
                  {r.name}
                  {s.written > 0 && <span className="ml-1.5 text-xs">({s.written})</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
