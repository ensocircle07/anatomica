import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

// System / Light / Dark toggle (ADR-0012 §8). The choice is kept per browser in localStorage;
// if storage is unavailable (private mode, blocked site data) the toggle still works for this visit.

export type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "anatomica.theme";
const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "Use system theme", Icon: Monitor },
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
];

function readChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage unavailable
  }
  return "system";
}

function apply(choice: ThemeChoice) {
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  document.documentElement.classList.toggle("dark", choice === "dark" || (choice === "system" && systemDark));
}

export function ThemeToggle() {
  // "system" on the server and on the first render; the real choice is read after mounting.
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => setChoice(readChoice()), []);

  useEffect(() => {
    apply(choice);
    if (choice !== "system") return;
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    query?.addEventListener("change", onChange);
    return () => query?.removeEventListener("change", onChange);
  }, [choice]);

  function choose(next: ThemeChoice) {
    setChoice(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable: the choice lasts for this visit only
    }
  }

  return (
    <div role="radiogroup" aria-label="Colour theme" className="flex rounded-full border border-line p-0.5">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={choice === value}
          aria-label={label}
          title={label}
          onClick={() => choose(value)}
          className={
            "flex h-11 w-11 items-center justify-center rounded-full " +
            (choice === value ? "bg-surface-sunken text-brand" : "text-fg-muted hover:text-fg")
          }
        >
          <Icon aria-hidden className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
