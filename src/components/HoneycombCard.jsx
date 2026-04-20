import { useMemo } from "react";
import { formatDate } from "../utils/graphUtils.js";

export default function HoneycombCard({ graph, onDelete, onOpen }) {
  const meta = useMemo(
    () => ({
      concepts: graph.nodes?.length || 0,
      links: graph.links?.length || 0,
      created: formatDate(graph.createdAt),
    }),
    [graph],
  );

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(graph.id);
  };

  return (
    <article
      className="hex-card group relative flex aspect-[1.08] min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden bg-neutral-900 p-6 text-center shadow-glow transition hover:-translate-y-1 hover:bg-neutral-800"
      onClick={() => onOpen(graph.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onOpen(graph.id);
        }
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(74,222,128,0.18),transparent_45%,rgba(244,63,94,0.14))]" />
      <button
        aria-label={`Delete ${graph.title}`}
        className="absolute right-7 top-6 z-10 rounded-md border border-rose-300/30 bg-black/40 px-2 py-1 text-xs text-rose-100 opacity-0 transition hover:bg-rose-500/30 group-hover:opacity-100"
        onClick={handleDelete}
        type="button"
      >
        Delete
      </button>
      <div className="relative z-10 max-w-[82%]">
        <p className="text-xs font-semibold uppercase text-emerald-200">{meta.created}</p>
        <h2 className="mt-2 line-clamp-3 text-lg font-bold text-neutral-50">{graph.title}</h2>
        <div className="mt-4 flex justify-center gap-2 text-xs text-neutral-300">
          <span className="rounded-md bg-black/35 px-2 py-1">{meta.concepts} concepts</span>
          <span className="rounded-md bg-black/35 px-2 py-1">{meta.links} links</span>
        </div>
      </div>
    </article>
  );
}
