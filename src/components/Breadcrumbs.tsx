import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NavLink } from "../core/graph/navigation.ts";

// Full trail on desktop; only the parent ("‹ Posterior cord") on mobile (ADR-0012).
export function Breadcrumbs({ trail }: { trail: NavLink[] }) {
  const parent = trail.length > 1 ? trail[trail.length - 2] : undefined;
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      {parent?.href && (
        <Link to={parent.href} className="inline-flex min-h-11 items-center gap-1 text-brand md:hidden">
          <ChevronLeft aria-hidden className="h-4 w-4" />
          {parent.label}
        </Link>
      )}
      <ol className="hidden flex-wrap items-center gap-1 md:flex">
        {trail.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 text-fg-muted" />}
            {item.href ? (
              <Link to={item.href} className={"rounded px-0.5 hover:underline " + (item.stub ? "text-fg-muted" : "text-brand")}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
