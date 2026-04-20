export function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function normalizeGraphData(graph) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const links = Array.isArray(graph?.links) ? graph.links : [];
  const seenNodes = new Set();

  const cleanNodes = nodes
    .map((node) => {
      const id = typeof node === "string" ? node : node?.id;
      return {
        id: String(id || "").trim(),
        group: Number.isFinite(Number(node?.group)) ? Number(node.group) : 0,
        value: Number.isFinite(Number(node?.value)) ? Number(node.value) : 1,
      };
    })
    .filter((node) => node.id)
    .filter((node) => {
      const key = node.id.toLowerCase();
      if (seenNodes.has(key)) {
        return false;
      }
      seenNodes.add(key);
      return true;
    })
    .slice(0, 45);

  const validIds = new Set(cleanNodes.map((node) => node.id));
  const seenLinks = new Set();

  const cleanLinks = links
    .map((link) => ({
      source: String(link?.source?.id || link?.source || "").trim(),
      target: String(link?.target?.id || link?.target || "").trim(),
      strength: Number.isFinite(Number(link?.strength)) ? Number(link.strength) : 1,
    }))
    .filter((link) => link.source && link.target)
    .filter((link) => validIds.has(link.source) && validIds.has(link.target))
    .filter((link) => link.source !== link.target)
    .filter((link) => {
      const key = [link.source, link.target].sort().join("::").toLowerCase();
      if (seenLinks.has(key)) {
        return false;
      }
      seenLinks.add(key);
      return true;
    })
    .slice(0, 90);

  return {
    nodes: cleanNodes,
    links: cleanLinks,
  };
}

export function getGraphStats(graphs) {
  return graphs.reduce(
    (stats, graph) => ({
      graphCount: stats.graphCount + 1,
      conceptCount: stats.conceptCount + (graph.nodes?.length || 0),
      linkCount: stats.linkCount + (graph.links?.length || 0),
    }),
    { graphCount: 0, conceptCount: 0, linkCount: 0 },
  );
}

export function getNodeNeighbors(graphData, nodeId) {
  if (!nodeId) {
    return [];
  }

  return graphData.links
    .filter((link) => {
      const source = link.source?.id || link.source;
      const target = link.target?.id || link.target;
      return source === nodeId || target === nodeId;
    })
    .map((link) => {
      const source = link.source?.id || link.source;
      const target = link.target?.id || link.target;
      return source === nodeId ? target : source;
    });
}

export function titleFromNotes(notes) {
  const firstLine = notes
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return "Untitled Knowledge Graph";
  }

  return firstLine.length > 54 ? `${firstLine.slice(0, 54)}...` : firstLine;
}
