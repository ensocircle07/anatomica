import { Link } from "react-router";
import { Bone, BookOpen, HeartPulse } from "lucide-react";
import { site } from "../../content/site.ts";
import { PageMeta } from "../../app/PageMeta.tsx";

// Phase 2 placeholder home page. Replaced by the real home page in Milestone 4.
export function HomePage() {
  return (
    <section className="space-y-8">
      <PageMeta path="/" />

      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-600 dark:text-brand-100">
          {site.subtitle}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">{site.tagline}</p>
      </div>

      <div
        role="status"
        className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
      >
        ANATOMICA is in early development. The atlas content has not been written yet.
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        <li className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <Bone aria-hidden className="mb-2 h-6 w-6 text-brand-600" />
          <h2 className="font-semibold">Anatomy atlas</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Regional, systematic and topographical anatomy.</p>
        </li>
        <li className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <BookOpen aria-hidden className="mb-2 h-6 w-6 text-brand-600" />
          <h2 className="font-semibold">Learning and exams</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Flashcards, questions and clinical cases.</p>
        </li>
        <li className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <HeartPulse aria-hidden className="mb-2 h-6 w-6 text-red-600" />
          <h2 className="font-semibold">First aid</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Practical emergency knowledge for everyone.</p>
        </li>
      </ul>

      <p className="text-sm">
        <Link to="/about" className="text-brand-600 underline">
          About this project
        </Link>
      </p>
    </section>
  );
}
