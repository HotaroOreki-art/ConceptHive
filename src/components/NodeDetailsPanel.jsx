export default function NodeDetailsPanel({ neighbors, node, nodes = [], onClose, onNodeSelect }) {
  if (!node) {
    return (
      <aside className="border border-neutral-800 bg-neutral-950 p-5">
        <p className="text-sm font-semibold text-emerald-300">Node details</p>
        <p className="mt-3 text-neutral-400">
          Select any concept in the graph to inspect its direct relationships.
        </p>
        <div className="mt-5 flex max-h-72 flex-wrap gap-2 overflow-auto pr-1">
          {nodes.map((item) => (
            <button
              className="rounded-md border border-neutral-700 px-3 py-2 text-left text-sm text-neutral-200 transition hover:border-emerald-300 hover:text-emerald-100"
              key={item.id}
              onClick={() => onNodeSelect(item)}
              type="button"
            >
              {item.id}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="border border-emerald-400/30 bg-neutral-950 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-300">Selected concept</p>
          <h2 className="mt-2 text-2xl font-bold text-neutral-50">{node.id}</h2>
        </div>
        <button
          className="rounded-lg border border-neutral-700 px-3 py-1 text-sm text-neutral-300 hover:border-neutral-500"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="mt-5">
        <p className="text-sm text-neutral-400">Direct links</p>
        {neighbors.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {neighbors.map((neighbor) => (
              <li key={neighbor}>
                <button
                  className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-200 transition hover:border-emerald-300 hover:text-emerald-100"
                  onClick={() => onNodeSelect({ id: neighbor })}
                  type="button"
                >
                  {neighbor}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">No direct relationships were extracted for this node.</p>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm text-neutral-400">All concepts</p>
        <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-auto pr-1">
          {nodes.map((item) => (
            <button
              className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                item.id === node.id
                  ? "border-amber-300 bg-amber-300/10 text-amber-100"
                  : "border-neutral-700 text-neutral-200 hover:border-emerald-300 hover:text-emerald-100"
              }`}
              key={item.id}
              onClick={() => onNodeSelect(item)}
              type="button"
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
