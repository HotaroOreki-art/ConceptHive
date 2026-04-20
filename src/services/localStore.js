const USERS_KEY = "concepthive:users";
const SESSION_KEY = "concepthive:session";
const GRAPH_PREFIX = "concepthive:graphs:";
const GRAPH_EVENT = "concepthive:graphs-updated";
const LOCAL_WORKSPACE_USER = {
  uid: "local-workspace",
  email: "local@concepthive.app",
  displayName: "Local Workspace",
  isDemoUser: true,
};

function readJson(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isDemoUser: true,
  };
}

function dispatchGraphUpdate(userId) {
  window.dispatchEvent(new CustomEvent(GRAPH_EVENT, { detail: { userId } }));
}

export function getLocalSessionUser() {
  const session = readJson(SESSION_KEY, null);
  if (!session?.uid) {
    return null;
  }

  const users = readJson(USERS_KEY, []);
  return publicUser(users.find((user) => user.uid === session.uid));
}

export function getOrCreateLocalWorkspaceUser() {
  const users = readJson(USERS_KEY, []);
  const existingUser = users.find((user) => user.uid === LOCAL_WORKSPACE_USER.uid);

  if (!existingUser) {
    writeJson(USERS_KEY, [
      ...users,
      {
        ...LOCAL_WORKSPACE_USER,
        password: "",
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  writeJson(SESSION_KEY, { uid: LOCAL_WORKSPACE_USER.uid });
  return LOCAL_WORKSPACE_USER;
}

export async function localSignup({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const users = readJson(USERS_KEY, []);

  if (users.some((user) => user.email === cleanEmail)) {
    throw new Error("A demo account with this email already exists.");
  }

  const user = {
    uid: crypto.randomUUID(),
    email: cleanEmail,
    displayName: name.trim() || cleanEmail.split("@")[0],
    password,
    createdAt: new Date().toISOString(),
  };

  writeJson(USERS_KEY, [...users, user]);
  writeJson(SESSION_KEY, { uid: user.uid });
  return publicUser(user);
}

export async function localLogin({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const users = readJson(USERS_KEY, []);
  const user = users.find((item) => item.email === cleanEmail && item.password === password);

  if (!user) {
    throw new Error("Invalid demo email or password.");
  }

  writeJson(SESSION_KEY, { uid: user.uid });
  return publicUser(user);
}

export async function localLogout() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function subscribeToLocalGraphs(userId, onData) {
  const emit = () => onData(readLocalGraphs(userId));
  const handler = (event) => {
    if (!event.detail?.userId || event.detail.userId === userId) {
      emit();
    }
  };

  emit();
  window.addEventListener(GRAPH_EVENT, handler);
  window.addEventListener("storage", emit);

  return () => {
    window.removeEventListener(GRAPH_EVENT, handler);
    window.removeEventListener("storage", emit);
  };
}

export function readLocalGraphs(userId) {
  return readJson(`${GRAPH_PREFIX}${userId}`, []).sort(
    (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
  );
}

export async function createLocalGraph(userId, graph) {
  const graphs = readLocalGraphs(userId);
  const graphId = crypto.randomUUID();
  const now = new Date().toISOString();
  const nextGraph = {
    ...graph,
    id: graphId,
    createdAt: now,
    updatedAt: now,
  };

  writeJson(`${GRAPH_PREFIX}${userId}`, [nextGraph, ...graphs]);
  dispatchGraphUpdate(userId);
  return graphId;
}

export async function getLocalGraph(userId, graphId) {
  return readLocalGraphs(userId).find((graph) => graph.id === graphId) || null;
}

export async function updateLocalGraph(userId, graphId, updates) {
  const graphs = readLocalGraphs(userId).map((graph) =>
    graph.id === graphId
      ? {
          ...graph,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : graph,
  );

  writeJson(`${GRAPH_PREFIX}${userId}`, graphs);
  dispatchGraphUpdate(userId);
}

export async function deleteLocalGraph(userId, graphId) {
  const graphs = readLocalGraphs(userId).filter((graph) => graph.id !== graphId);
  writeJson(`${GRAPH_PREFIX}${userId}`, graphs);
  dispatchGraphUpdate(userId);
}
