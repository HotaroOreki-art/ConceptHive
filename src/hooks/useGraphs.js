import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createGraph as createGraphDocument,
  deleteGraph as deleteGraphDocument,
  subscribeToGraphs,
  updateGraph as updateGraphDocument,
} from "../services/graphService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function useGraphs() {
  const { user } = useAuth();
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setGraphs([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeToGraphs(user.uid, {
      onData: (nextGraphs) => {
        setGraphs(nextGraphs);
        setError("");
        setLoading(false);
      },
      onError: (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    });

    return unsubscribe;
  }, [user]);

  const createGraph = useCallback(
    async (graph) => {
      if (!user) {
        throw new Error("You must be signed in to save a graph.");
      }
      return createGraphDocument(user.uid, graph);
    },
    [user],
  );

  const updateGraph = useCallback(
    async (graphId, updates) => {
      if (!user) {
        throw new Error("You must be signed in to update a graph.");
      }
      return updateGraphDocument(user.uid, graphId, updates);
    },
    [user],
  );

  const deleteGraph = useCallback(
    async (graphId) => {
      if (!user) {
        throw new Error("You must be signed in to delete a graph.");
      }
      return deleteGraphDocument(user.uid, graphId);
    },
    [user],
  );

  return useMemo(
    () => ({
      createGraph,
      deleteGraph,
      error,
      graphs,
      loading,
      updateGraph,
    }),
    [createGraph, deleteGraph, error, graphs, loading, updateGraph],
  );
}
