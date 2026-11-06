import { Link, NavLink, Outlet } from "react-router";
import { site } from "../content/site.ts";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About", end: false },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="font-semibold tracking-[0.2em] text-brand-700 dark:text-brand-100">
            {site.name}
          </Link>
          <nav aria-label="Main">
            <ul className="flex gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      "rounded px-3 py-2 text-sm " +
                      (isActive
                        ? "bg-brand-50 font-medium text-brand-700 dark:bg-slate-800 dark:text-brand-100"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="mx-auto max-w-5xl space-y-1 px-4 py-6">
          <p>{site.disclaimer}</p>
          <p>
            Code: {site.licences.code} · Content: {site.licences.content} ·{" "}
            <a href={site.repositoryUrl} className="underline hover:text-brand-600">
              Source on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
