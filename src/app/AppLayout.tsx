import { Link, NavLink, Outlet } from "react-router";
import { Home, Info, Layers, Map, Stethoscope, type LucideIcon } from "lucide-react";
import { site } from "../content/site.ts";
import { ThemeToggle } from "./theme/ThemeToggle.tsx";

// Only built sections appear in the navigation (ADR-0012 §3).
// Search, Learn, First Aid and Me are added in their own milestones.
const navItems: { to: string; label: string; end: boolean; Icon: LucideIcon; desktop: boolean }[] = [
  { to: "/", label: "Home", end: true, Icon: Home, desktop: false },
  { to: "/regions", label: "Regions", end: false, Icon: Map, desktop: true },
  { to: "/systems", label: "Systems", end: false, Icon: Layers, desktop: true },
  { to: "/systems/clinical", label: "Clinical", end: false, Icon: Stethoscope, desktop: true },
  { to: "/about", label: "About", end: false, Icon: Info, desktop: true },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-strong focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <Link to="/" className="flex min-h-11 items-center font-semibold tracking-[0.2em] text-brand">
            {site.name}
          </Link>
          <div className="flex items-center gap-2">
            <nav aria-label="Main" className="hidden md:block">
              <ul className="flex gap-1">
                {navItems.filter((item) => item.desktop).map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        "flex min-h-11 items-center rounded px-3 text-sm " +
                        (isActive ? "bg-surface-sunken font-medium text-brand" : "text-fg-muted hover:bg-surface-sunken hover:text-fg")
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <ThemeToggle />
          </div>
        </div>
        <p className="border-t border-draft-line bg-draft-bg px-4 py-1.5 text-center text-xs text-draft-fg">
          Draft atlas — content is AI-assisted and not yet expert-reviewed.{" "}
          <Link to="/about" className="underline">
            What this means
          </Link>
        </p>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 md:pb-10">
        <Outlet />
      </main>

      <footer className="border-t border-line pb-20 text-xs text-fg-muted md:pb-0">
        <div className="mx-auto max-w-6xl space-y-1 px-4 py-6">
          <p>{site.disclaimer}</p>
          <p>
            Code: {site.licences.code} · Content: {site.licences.content} ·{" "}
            <a href={site.repositoryUrl} className="underline hover:text-brand">
              Source on GitHub
            </a>
          </p>
        </div>
      </footer>

      {/* Mobile bottom bar (ARCHITECTURE §8). Touch targets ≥ 44 px; clears the phone's home indicator. */}
      <nav
        aria-label="Main (mobile)"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-raised pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="flex">
          {navItems.map(({ to, label, end, Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs " +
                  (isActive ? "font-medium text-brand" : "text-fg-muted")
                }
              >
                <Icon aria-hidden className="h-5 w-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
