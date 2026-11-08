import { useId } from "react";

/** A titled page section: always an <h2>, so heading levels stay in order (ADR-0012 §7). */
export function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      {note && <p className="text-sm text-fg-muted">{note}</p>}
      {children}
    </section>
  );
}

/** Small label, e.g. "main" / "minor" / "prime". Text, not colour alone. */
export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "strong" | "draft" }) {
  const styles = {
    neutral: "border-line text-fg-muted",
    strong: "border-brand text-brand",
    draft: "border-draft-line bg-draft-bg text-draft-fg",
  }[tone];
  return <span className={`inline-block rounded border px-1.5 py-0.5 text-xs leading-none ${styles}`}>{children}</span>;
}

/** Label/value facts. Two columns from md up; stacked on phones so nothing scrolls sideways. */
export function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-line rounded-lg border border-line bg-surface-raised">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-4 py-3 md:grid-cols-[11rem_1fr] md:gap-4">
          <dt className="text-sm font-medium text-fg-muted">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A plain list of nodes, or a muted "none recorded" line. */
export function List({ items, empty = "None recorded yet." }: { items: React.ReactNode[]; empty?: string }) {
  if (items.length === 0) return <p className="text-sm text-fg-muted">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
