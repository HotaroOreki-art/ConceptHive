import {
  createLocalGraph,
  deleteLocalGraph,
  getLocalGraph,
  subscribeToLocalGraphs,
  updateLocalGraph,
} from "./localStore.js";
import { hasSupabaseConfig, supabase } from "./supabase.js";

const SUPABASE_GRAPH_EVENT = "concepthive:supabase-graphs-updated";

function mapGraphRow(row) {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    nodes: row.nodes || [],
    links: row.links || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function emitGraphUpdate(userId) {
  window.dispatchEvent(new CustomEvent(SUPABASE_GRAPH_EVENT, { detail: { userId } }));
}

async function fetchSupabaseGraphs(userId) {
  const { data, error } = await supabase
    .from("graphs")
    .select("id,title,notes,nodes,links,created_at,updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapGraphRow);
}

export function subscribeToGraphs(userId, { onData, onError }) {
  if (!userId) {
    return () => {};
  }

  if (!hasSupabaseConfig || !supabase) {
    return subscribeToLocalGraphs(userId, onData);
  }

  let active = true;

  const loadGraphs = async () => {
    try {
      const graphs = await fetchSupabaseGraphs(userId);
      if (active) {
        onData(graphs);
      }
    } catch (error) {
      if (active) {
        onError(error);
      }
    }
  };

  loadGraphs();

  const storageHandler = (event) => {
    if (!event.detail?.userId || event.detail.userId === userId) {
      loadGraphs();
    }
  };

  window.addEventListener(SUPABASE_GRAPH_EVENT, storageHandler);

  const channel = supabase
    .channel(`graphs-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "graphs",
        filter: `user_id=eq.${userId}`,
      },
      loadGraphs,
    )
    .subscribe();

  return () => {
    active = false;
    window.removeEventListener(SUPABASE_GRAPH_EVENT, storageHandler);
    supabase.removeChannel(channel);
  };
}

export async function createGraph(userId, graph) {
  if (!hasSupabaseConfig || !supabase) {
    return createLocalGraph(userId, graph);
  }

  const { data, error } = await supabase
    .from("graphs")
    .insert({
      user_id: userId,
      title: graph.title,
      notes: graph.notes,
      nodes: graph.nodes,
      links: graph.links,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  emitGraphUpdate(userId);
  return data.id;
}

export async function getGraph(userId, graphId) {
  if (!hasSupabaseConfig || !supabase) {
    return getLocalGraph(userId, graphId);
  }

  const { data, error } = await supabase
    .from("graphs")
    .select("id,title,notes,nodes,links,created_at,updated_at")
    .eq("id", graphId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapGraphRow(data) : null;
}

export async function updateGraph(userId, graphId, updates) {
  if (!hasSupabaseConfig || !supabase) {
    return updateLocalGraph(userId, graphId, updates);
  }

  const payload = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) {
    payload.title = updates.title;
  }
  if (updates.notes !== undefined) {
    payload.notes = updates.notes;
  }
  if (updates.nodes !== undefined) {
    payload.nodes = updates.nodes;
  }
  if (updates.links !== undefined) {
    payload.links = updates.links;
  }

  const { error } = await supabase
    .from("graphs")
    .update(payload)
    .eq("id", graphId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  emitGraphUpdate(userId);
}

export async function deleteGraph(userId, graphId) {
  if (!hasSupabaseConfig || !supabase) {
    return deleteLocalGraph(userId, graphId);
  }

  const { error } = await supabase
    .from("graphs")
    .delete()
    .eq("id", graphId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  emitGraphUpdate(userId);
}
