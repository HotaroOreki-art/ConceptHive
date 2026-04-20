import { createContext, useCallback, useContext, useMemo, useState } from "react";

const GraphContext = createContext(null);

export function GraphProvider({ children }) {
  const [activeGraph, setActiveGraph] = useState(null);

  const clearActiveGraph = useCallback(() => {
    setActiveGraph(null);
  }, []);

  const value = useMemo(
    () => ({
      activeGraph,
      clearActiveGraph,
      setActiveGraph,
    }),
    [activeGraph, clearActiveGraph],
  );

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
}

export function useGraphContext() {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error("useGraphContext must be used inside GraphProvider");
  }
  return context;
}
