import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import NodeDetailsPanel from "../components/NodeDetailsPanel.jsx";
import PageShell from "../components/PageShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useGraphContext } from "../context/GraphContext.jsx";
import useGraphs from "../hooks/useGraphs.js";
import { getGraph } from "../services/graphService.js";
import { getNodeNeighbors, normalizeGraphData } from "../utils/graphUtils.js";

const GraphCanvas = lazy(() => import("../components/GraphCanvas.jsx"));

export default function GraphView() {
  const { graphId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeGraph, clearActiveGraph, setActiveGraph } = useGraphContext();
  const { deleteGraph, updateGraph } = useGraphs();
  const [graph, setGraph] = useState(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingTitle, setSavingTitle] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadGraph() {
      if (!user || !graphId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const nextGraph =
          activeGraph?.id === graphId ? activeGraph : await getGraph(user.uid, graphId);

        if (!nextGraph) {
          throw new Error("That graph could not be found.");
        }

        if (!ignore) {
          setGraph(nextGraph);
          setTitleDraft(nextGraph.title || "");
          setActiveGraph(nextGraph);
        }
      } catch (nextError) {
        if (!ignore) {
          setError(nextError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadGraph();

    return () => {
      ignore = true;
    };
  }, [activeGraph, graphId, setActiveGraph, user]);

  const graphData = useMemo(() => normalizeGraphData(graph), [graph]);

  const selectedNode = useMemo(
    () => (selectedNodeId ? graphData.nodes.find((node) => node.id === selectedNodeId) : null),
    [graphData.nodes, selectedNodeId],
  );

  const neighbors = useMemo(
    () => getNodeNeighbors(graphData, selectedNodeId),
    [graphData, selectedNodeId],
  );

  const handleNodeClick = useCallback((node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleSaveTitle = async () => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle || nextTitle === graph.title) {
      return;
    }

    setSavingTitle(true);
    setError("");

    try {
      await updateGraph(graphId, { title: nextTitle });
      const updatedGraph = { ...graph, title: nextTitle };
      setGraph(updatedGraph);
      setActiveGraph(updatedGraph);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this graph permanently?");
    if (!confirmed) {
      return;
    }

    await deleteGraph(graphId);
    clearActiveGraph();
    navigate("/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-96 items-center justify-center border border-neutral-800 bg-neutral-950">
          <LoadingSpinner label="Loading graph" />
        </div>
      </PageShell>
    );
  }

  if (error && !graph) {
    return (
      <PageShell>
        <section className="border border-rose-400/40 bg-rose-400/10 p-6 text-rose-100">
          <h1 className="text-2xl font-bold">Graph unavailable</h1>
          <p className="mt-3">{error}</p>
          <Link className="mt-5 inline-block text-emerald-200 underline" to="/dashboard">
            Back to dashboard
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-emerald-300">Interactive graph</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-3xl font-black text-neutral-50"
              onChange={(event) => setTitleDraft(event.target.value)}
              value={titleDraft}
            />
            <button
              className="rounded-lg border border-emerald-400/40 px-4 py-3 font-semibold text-emerald-200 transition hover:bg-emerald-400/10 disabled:opacity-60"
              disabled={savingTitle}
              onClick={handleSaveTitle}
              type="button"
            >
              {savingTitle ? "Saving" : "Save"}
            </button>
          </div>
          <p className="mt-3 text-neutral-400">
            Drag nodes, zoom the canvas, and select concepts to inspect direct relationships.
          </p>
        </div>

        <button
          className="w-fit rounded-lg border border-rose-300/40 px-4 py-3 font-semibold text-rose-100 transition hover:bg-rose-400/10"
          onClick={handleDelete}
          type="button"
        >
          Delete Graph
        </button>
      </section>

      {error && (
        <p className="mt-5 border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>
      )}

      <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_330px]">
        <Suspense
          fallback={
            <div className="flex h-[68vh] min-h-[430px] items-center justify-center border border-neutral-800 bg-neutral-950">
              <LoadingSpinner label="Preparing graph canvas" />
            </div>
          }
        >
          <GraphCanvas
            graphData={graphData}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNodeId}
          />
        </Suspense>
        <NodeDetailsPanel
          neighbors={neighbors}
          node={selectedNode}
          nodes={graphData.nodes}
          onClose={() => setSelectedNodeId("")}
          onNodeSelect={handleNodeClick}
        />
      </section>

      <section className="mt-6 border border-neutral-800 bg-neutral-950 p-5">
        <p className="text-sm font-semibold text-neutral-300">Original notes</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-400">{graph.notes}</p>
      </section>
    </PageShell>
  );
}
