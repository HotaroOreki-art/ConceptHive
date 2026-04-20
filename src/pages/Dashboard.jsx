import { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import HoneycombCard from "../components/HoneycombCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageShell from "../components/PageShell.jsx";
import StatTile from "../components/StatTile.jsx";
import useGraphs from "../hooks/useGraphs.js";
import { getGraphStats } from "../utils/graphUtils.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { deleteGraph, error, graphs, loading } = useGraphs();
  const stats = useMemo(() => getGraphStats(graphs), [graphs]);

  const handleOpen = useCallback(
    (graphId) => {
      navigate(`/graph/${graphId}`);
    },
    [navigate],
  );

  const handleDelete = useCallback(
    async (graphId) => {
      const confirmed = window.confirm("Delete this saved graph?");
      if (!confirmed) {
        return;
      }
      await deleteGraph(graphId);
    },
    [deleteGraph],
  );

  return (
    <PageShell>
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-300">Honeycomb dashboard</p>
          <h1 className="mt-2 text-4xl font-black text-neutral-50">Your knowledge graphs</h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Each hexagon is a saved map generated from your notes. Open one to explore concept links.
          </p>
        </div>
        <Link
          className="inline-flex w-fit rounded-lg bg-emerald-400 px-4 py-3 font-bold text-neutral-950 transition hover:bg-emerald-300"
          to="/create"
        >
          Generate Knowledge Graph
        </Link>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatTile label="Saved graphs" value={stats.graphCount} />
        <StatTile label="Extracted concepts" tone="amber" value={stats.conceptCount} />
        <StatTile label="Mapped relationships" tone="rose" value={stats.linkCount} />
      </section>

      {error && (
        <p className="mt-6 border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</p>
      )}

      <section className="mt-10">
        {loading ? (
          <div className="flex min-h-56 items-center justify-center border border-neutral-800 bg-neutral-950">
            <LoadingSpinner label="Loading saved graphs" />
          </div>
        ) : graphs.length ? (
          <div className="honeycomb-grid pb-12">
            {graphs.map((graph) => (
              <HoneycombCard graph={graph} key={graph.id} onDelete={handleDelete} onOpen={handleOpen} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </PageShell>
  );
}
