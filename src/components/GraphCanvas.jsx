import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const NODE_COLORS = ["#4ade80", "#f59e0b", "#38bdf8", "#fb7185", "#a3e635"];

function trimLabel(label) {
  return label.length > 28 ? `${label.slice(0, 25)}...` : label;
}

export default function GraphCanvas({ graphData, onNodeClick, selectedNodeId }) {
  const wrapperRef = useRef(null);
  const graphRef = useRef(null);
  const [size, setSize] = useState({ width: 720, height: 520 });
  const [hoveredNodeId, setHoveredNodeId] = useState("");
  const [layoutSeed, setLayoutSeed] = useState(0);

  const displayGraphData = useMemo(() => {
    const degreeMap = new Map();
    const selectedRelatedIds = new Set(selectedNodeId ? [selectedNodeId] : []);
    const highlightedLinks = new Set();

    graphData.links.forEach((link, index) => {
      const source = link.source?.id || link.source;
      const target = link.target?.id || link.target;
      degreeMap.set(source, (degreeMap.get(source) || 0) + 1);
      degreeMap.set(target, (degreeMap.get(target) || 0) + 1);

      if (selectedNodeId && (source === selectedNodeId || target === selectedNodeId)) {
        selectedRelatedIds.add(source);
        selectedRelatedIds.add(target);
        highlightedLinks.add(index);
      }
    });

    const centerNodeId = [...degreeMap.entries()].sort((first, second) => second[1] - first[1])[0]?.[0];
    const nodeCount = Math.max(graphData.nodes.length, 1);

    return {
      nodes: graphData.nodes.map((node, index) => {
        const degree = degreeMap.get(node.id) || 0;
        const group = Number.isFinite(Number(node.group)) ? Number(node.group) : index % NODE_COLORS.length;
        const isCenter = node.id === centerNodeId || (!centerNodeId && index === 0);
        const angle = (index / nodeCount) * Math.PI * 2 + group * 0.32 + layoutSeed * 0.43;
        const ring = isCenter ? 0 : 170 + (index % 4) * 42 + group * 18;

        return {
          ...node,
          degree,
          group,
          isDimmed: Boolean(selectedNodeId && !selectedRelatedIds.has(node.id)),
          val: Math.max(1, degree),
          x: isCenter ? 0 : Math.cos(angle) * ring,
          y: isCenter ? 0 : Math.sin(angle) * ring,
        };
      }),
      links: graphData.links.map((link, index) => ({
        ...link,
        isDimmed: Boolean(selectedNodeId && !highlightedLinks.has(index)),
        isHighlighted: highlightedLinks.has(index),
      })),
    };
  }, [graphData, layoutSeed, selectedNodeId]);

  useEffect(() => {
    if (!wrapperRef.current) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(320, entry.contentRect.width),
        height: Math.max(420, entry.contentRect.height),
      });
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) {
      return undefined;
    }

    graph.d3Force("charge")?.strength(-560);
    graph.d3Force("center")?.strength?.(0.035);

    const linkForce = graph.d3Force("link");
    linkForce?.distance((link) => 130 + Math.max(0, 4 - (link.strength || 1)) * 24);
    linkForce?.strength((link) => Math.min(0.45, 0.16 + (link.strength || 1) * 0.06));
    graph.d3ReheatSimulation();

    const timer = window.setTimeout(() => {
      graphRef.current?.zoomToFit(450, 70);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [displayGraphData, size.height, size.width]);

  const fitGraph = useCallback(() => {
    graphRef.current?.zoomToFit(450, 85);
  }, []);

  const shuffleLayout = useCallback(() => {
    setLayoutSeed((current) => current + 1);
    graphRef.current?.d3ReheatSimulation();
    window.setTimeout(() => graphRef.current?.zoomToFit(450, 85), 350);
  }, []);

  const drawNode = useCallback(
    (node, ctx, globalScale) => {
      const label = trimLabel(node.id);
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const degreeBoost = Math.min(6, node.degree || 0);
      const radius = (isSelected ? 12 : isHovered ? 10 : 8) + degreeBoost * 0.45;
      const fontSize = Math.max(10, 12.5 / globalScale);
      const nodeColor = NODE_COLORS[Math.abs(node.group || 0) % NODE_COLORS.length];

      ctx.save();
      ctx.globalAlpha = node.isDimmed ? 0.34 : 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = isSelected ? "#fbbf24" : isHovered ? "#f8fafc" : nodeColor;
      ctx.fill();
      ctx.lineWidth = isSelected || isHovered ? 2.5 : 1.3;
      ctx.strokeStyle = isSelected ? "#fff7ed" : "#102016";
      ctx.stroke();

      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#f5f5f4";

      const textWidth = ctx.measureText(label).width;
      const padding = 6;
      ctx.fillStyle = isSelected ? "rgba(69, 26, 3, 0.86)" : "rgba(8, 10, 9, 0.78)";
      ctx.fillRect(
        node.x - textWidth / 2 - padding,
        node.y + radius + 3,
        textWidth + padding * 2,
        fontSize + padding,
      );

      ctx.fillStyle = "#f5f5f4";
      ctx.fillText(label, node.x, node.y + radius + 5);
      ctx.restore();
    },
    [hoveredNodeId, selectedNodeId],
  );

  const paintPointerArea = useCallback((node, color, ctx, globalScale) => {
    const label = trimLabel(node.id);
    const fontSize = Math.max(10, 13 / globalScale);
    const radius = Math.max(18, 34 / globalScale);

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const labelHeight = fontSize + 10;
    ctx.fillRect(
      node.x - textWidth / 2 - 10,
      node.y + radius / 2,
      textWidth + 20,
      labelHeight,
    );
    ctx.restore();
  }, []);

  const handleNodeClick = useCallback(
    (node) => {
      onNodeClick(node);
      if (typeof node.x === "number" && typeof node.y === "number") {
        graphRef.current?.centerAt(node.x, node.y, 350);
      }
    },
    [onNodeClick],
  );

  return (
    <div
      className={`graph-canvas relative h-[68vh] min-h-[430px] overflow-hidden border border-neutral-800 bg-[#0b0f0c] ${
        hoveredNodeId ? "is-node-hover" : ""
      }`}
      ref={wrapperRef}
      style={{ cursor: hoveredNodeId ? "pointer" : "grab" }}
    >
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          className="rounded-lg border border-neutral-700 bg-black/70 px-3 py-2 text-sm font-semibold text-neutral-100 backdrop-blur transition hover:border-emerald-300"
          onClick={shuffleLayout}
          type="button"
        >
          Shuffle
        </button>
        <button
          className="rounded-lg border border-neutral-700 bg-black/70 px-3 py-2 text-sm font-semibold text-neutral-100 backdrop-blur transition hover:border-emerald-300"
          onClick={fitGraph}
          type="button"
        >
          Fit graph
        </button>
      </div>
      <ForceGraph2D
        cooldownTicks={180}
        d3AlphaDecay={0.018}
        d3VelocityDecay={0.22}
        enableNodeDrag
        graphData={displayGraphData}
        height={size.height}
        linkColor={(link) =>
          link.isHighlighted
            ? "rgba(251, 191, 36, 0.95)"
            : link.isDimmed
              ? "rgba(120, 113, 108, 0.18)"
              : "rgba(245, 158, 11, 0.5)"
        }
        linkDirectionalParticles={(link) => (link.isHighlighted ? 4 : 1)}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={(link) => (link.isHighlighted ? 2.8 : 1.3)}
        linkWidth={(link) =>
          link.isHighlighted
            ? 3.2
            : link.isDimmed
              ? 0.55
              : 1 + Math.min(2.2, (link.strength || 1) * 0.28)
        }
        nodeCanvasObject={drawNode}
        nodeCanvasObjectMode={() => "replace"}
        nodeLabel={(node) => node.id}
        nodePointerAreaPaint={paintPointerArea}
        nodeRelSize={8}
        onBackgroundClick={() => setHoveredNodeId("")}
        onNodeClick={handleNodeClick}
        onNodeHover={(node) => setHoveredNodeId(node?.id || "")}
        ref={graphRef}
        width={size.width}
      />
    </div>
  );
}
