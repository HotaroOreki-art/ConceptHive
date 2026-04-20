import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateKnowledgeGraph } from "../api/graphApi.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageShell from "../components/PageShell.jsx";
import { useGraphContext } from "../context/GraphContext.jsx";
import useGraphs from "../hooks/useGraphs.js";
import { normalizeGraphData, titleFromNotes } from "../utils/graphUtils.js";

const SAMPLE_NOTES = `React is a JavaScript library for building user interfaces.
Components are reusable pieces of UI. Props pass data from parent to child components.
State stores data that changes over time. The useState hook manages local component state.
The useEffect hook runs side effects such as fetching data or subscribing to events.
React Router enables navigation between pages in a single page application.
Context API shares global data like authentication state without prop drilling.`;

export default function CreateGraph() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const { setActiveGraph } = useGraphContext();
  const { createGraph } = useGraphs();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleUseSample = useCallback(() => {
    setTitle("React Fundamentals");
    setNotes(SAMPLE_NOTES);
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedNotes = notes.trim();
    if (trimmedNotes.length < 80) {
      setError("Paste at least a short paragraph of notes so the AI has enough context.");
      return;
    }

    setGenerating(true);

    try {
      const graph = normalizeGraphData(await generateKnowledgeGraph(trimmedNotes));

      if (!graph.nodes.length) {
        throw new Error("No concepts were extracted. Try adding more detailed notes.");
      }

      const graphTitle = title.trim() || titleFromNotes(trimmedNotes);
      const graphId = await createGraph({
        title: graphTitle,
        notes: trimmedNotes,
        nodes: graph.nodes,
        links: graph.links,
      });

      setActiveGraph({
        id: graphId,
        title: graphTitle,
        notes: trimmedNotes,
        nodes: graph.nodes,
        links: graph.links,
      });

      navigate(`/graph/${graphId}`);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageShell>
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold text-emerald-300">Generate graph</p>
          <h1 className="mt-2 text-4xl font-black text-neutral-50">Paste your notes.</h1>
          <p className="mt-4 text-neutral-400">
            ConceptHive extracts key ideas and direct relationships, then saves the result to your
            private Supabase database.
          </p>

          <div className="mt-8 border border-neutral-800 bg-neutral-950 p-5">
            <p className="font-semibold text-neutral-100">What works best?</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              <li>Use notes with definitions, causes, examples, or steps.</li>
              <li>Keep one topic per graph for a cleaner map.</li>
              <li>Rename the graph later from the graph view.</li>
            </ul>
          </div>
        </div>

        <form className="border border-neutral-800 bg-neutral-950 p-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-neutral-300">Graph title</span>
            <input
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-[#080a09] px-4 py-3 text-neutral-50 placeholder:text-neutral-600"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="React Hooks, Photosynthesis, DBMS Normalization..."
              type="text"
              value={title}
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm text-neutral-300">Study notes</span>
            <textarea
              className="mt-2 min-h-[360px] w-full resize-y rounded-lg border border-neutral-700 bg-[#080a09] px-4 py-3 text-neutral-50 placeholder:text-neutral-600"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Paste your study notes here..."
              ref={textareaRef}
              value={notes}
            />
          </label>

          {error && (
            <p className="mt-4 border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-emerald-400 px-4 py-3 font-bold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={generating}
              type="submit"
            >
              {generating ? <LoadingSpinner label="Generating graph" /> : "Generate Knowledge Graph"}
            </button>
            <button
              className="rounded-lg border border-neutral-700 px-4 py-3 font-semibold text-neutral-200 transition hover:border-neutral-500"
              disabled={generating}
              onClick={handleUseSample}
              type="button"
            >
              Use Sample Notes
            </button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
