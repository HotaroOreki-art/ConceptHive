import { Link } from "react-router-dom";

export default function EmptyState() {
  return (
    <section className="grid gap-6 border border-neutral-800 bg-neutral-950 p-6 md:grid-cols-[1fr_0.85fr] md:items-center">
      <div>
        <p className="text-sm font-semibold text-emerald-300">No graphs yet</p>
        <h2 className="mt-2 text-2xl font-bold text-neutral-50">Paste study notes and grow your first hive.</h2>
        <p className="mt-3 text-neutral-400">
          ConceptHive extracts the important concepts and turns them into an interactive revision map.
        </p>
        <Link
          className="mt-5 inline-flex rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-neutral-950 transition hover:bg-emerald-300"
          to="/create"
        >
          Create Knowledge Graph
        </Link>
      </div>
      <div className="hidden md:grid md:grid-cols-3 md:gap-3">
        {["Notes", "Concepts", "Graph", "Links", "Review", "Memory"].map((item) => (
          <div
            className="hex-card grid aspect-square place-items-center bg-neutral-900 px-4 text-center text-sm font-semibold text-neutral-200"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
