// Prose: plain text with [[entity.id]] graph links, split into paragraphs on blank lines.
// Pure logic: no React, no DOM (ADR-0005). The validator guarantees every link resolves.

export type ProsePart = { text: string } | { link: string };

export function parseProse(text: string): ProsePart[][] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((paragraph) => {
      const parts: ProsePart[] = [];
      let last = 0;
      for (const m of paragraph.matchAll(/\[\[([^\]]+)\]\]/g)) {
        if (m.index > last) parts.push({ text: paragraph.slice(last, m.index) });
        parts.push({ link: m[1]! });
        last = m.index + m[0].length;
      }
      if (last < paragraph.length) parts.push({ text: paragraph.slice(last) });
      return parts;
    });
}
