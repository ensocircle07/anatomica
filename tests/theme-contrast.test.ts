// Checks the theme tokens in src/styles/index.css against WCAG 2.x AA contrast (ADR-0012 §8).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(import.meta.dirname, "..", "src", "styles", "index.css"), "utf8");

function tokens(selector: ":root" | ".dark"): Record<string, string> {
  const escaped = selector.replace(".", "\\.");
  const block = new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`).exec(css)?.[1];
  if (!block) throw new Error(`no ${selector} block in index.css`);
  return Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1]!, m[2]!]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** [foreground, background, minimum ratio]. Text needs 4.5; focus outlines and borders of controls need 3. */
const pairs: [string, string, number][] = [
  ["fg", "surface", 4.5], ["fg", "surface-raised", 4.5], ["fg", "surface-sunken", 4.5],
  ["fg-muted", "surface", 4.5], ["fg-muted", "surface-raised", 4.5],
  ["brand", "surface", 4.5], ["brand", "surface-raised", 4.5], ["brand-strong", "surface", 4.5],
  ["draft-fg", "draft-bg", 4.5], ["stub-fg", "stub-bg", 4.5],
  ["checked-fg", "checked-bg", 4.5], ["reviewed-fg", "reviewed-bg", 4.5],
  ["focus", "surface", 3],
];

describe.each([":root", ".dark"] as const)("theme %s", (selector) => {
  const t = tokens(selector);
  it.each(pairs)("%s on %s meets %d:1", (fg, bg, min) => {
    expect(t[fg], `missing --${fg}`).toBeDefined();
    expect(t[bg], `missing --${bg}`).toBeDefined();
    expect(contrast(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(min);
  });
});
