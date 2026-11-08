import { parseProse } from "../core/prose.ts";
import { EntityLink } from "./EntityLink.tsx";

/** Renders prose with [[entity.id]] links as paragraphs (or inline, for short values). */
export function Prose({ text, inline = false }: { text: string; inline?: boolean }) {
  const paragraphs = parseProse(text);
  const render = (parts: ReturnType<typeof parseProse>[number]) =>
    parts.map((part, i) => ("link" in part ? <EntityLink key={i} id={part.link} /> : <span key={i}>{part.text}</span>));

  if (inline) return <>{paragraphs.map((p, i) => <span key={i}>{render(p)} </span>)}</>;
  return (
    <div className="space-y-3 leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i}>{render(p)}</p>
      ))}
    </div>
  );
}
