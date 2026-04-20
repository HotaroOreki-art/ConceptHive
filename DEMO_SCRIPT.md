# ConceptHive Demo Script

## Problem Statement

Students often collect study material as long, unstructured notes. During revision, those notes become hard to scan because important concepts, dependencies, and relationships are hidden inside paragraphs. A student may know the individual definitions but still struggle to understand how topics connect.

ConceptHive solves this by turning raw study notes into an interactive knowledge graph. The app extracts concepts and relationships from notes, saves each graph to the user's account, and lets the student explore connected ideas visually. This helps learners revise by structure instead of rereading the same text repeatedly.

## 5-Minute Demo Flow

### 0:00-0:35 — Introduction

Hi, my project is called ConceptHive. It is an AI-powered knowledge graph builder for students.

The problem I am solving is that study notes are usually linear and messy. When students revise from long paragraphs, it is difficult to see which concepts are important and how they are connected. ConceptHive converts those notes into a visual graph, so revision becomes more interactive and relationship-based.

### 0:35-1:10 — Tech Stack

The frontend is built with React and Vite. I used React Router for navigation, Tailwind CSS for the UI, and react-force-graph-2d for the canvas-based graph visualization.

For the backend, I used Supabase Authentication and Supabase Postgres. Each user's graphs are saved privately in the database with row-level security. For AI generation, the app uses a Vercel serverless function, so API keys are never exposed in the frontend.

### 1:10-1:50 — Authentication And Dashboard

Here is the login and signup flow. The app supports email/password authentication using Supabase.

After login, the user reaches the dashboard. The dashboard uses a honeycomb-style layout where each hexagon represents a saved knowledge graph. This screen also shows the number of saved graphs, extracted concepts, and mapped relationships.

### 1:50-2:45 — Creating A Knowledge Graph

Now I will create a new graph. The user can paste study notes into this textarea and click Generate Knowledge Graph.

The frontend sends the notes to a Vercel API route called `/api/generate-graph`. That route calls the AI provider and asks it to return structured JSON with `nodes` and `links`. The graph data is then normalized, saved to Supabase, and displayed in the graph viewer.

The app supports Gemini as the preferred AI provider, and it also has a local fallback extractor. This means the project remains usable during demos even if an AI provider is temporarily unavailable.

### 2:45-3:45 — Graph Viewer

This is the interactive graph view. Each node is a concept and each link is a relationship between concepts.

The graph supports zooming, panning, dragging nodes, and selecting concepts. When I click a node, the connected relationships are highlighted, unrelated nodes are dimmed, and the details panel shows direct links. I can also click neighboring concepts from the side panel.

The Shuffle button rearranges the graph layout, and Fit Graph brings the full graph back into view. This makes the visualization easier to explore on different screen sizes.

### 3:45-4:25 — CRUD And Persistence

This project includes full CRUD functionality. A user can create a graph from notes, read saved graphs from the dashboard, update the graph title, and delete graphs.

The data is persistent because graphs are stored in Supabase under the logged-in user. Row-level security ensures users can only access their own graph records.

### 4:25-5:00 — React Concepts And Closing

The project demonstrates core React concepts like functional components, props, state with `useState`, side effects with `useEffect`, conditional rendering, lists and keys, controlled components, routing, and Context API.

It also uses advanced concepts like `useMemo` for graph calculations, `useCallback` for stable event handlers, `useRef` for graph and textarea references, and lazy loading with `React.lazy` and `Suspense`.

In short, ConceptHive helps students turn unstructured notes into connected visual knowledge maps, making revision more meaningful and easier to understand.

## Short Viva Answer

ConceptHive is a React application that helps students convert study notes into interactive knowledge graphs. It uses Supabase for authentication and persistent graph storage, a Vercel serverless API route for AI-based graph generation, and react-force-graph-2d for visualization. The main goal is to help students understand relationships between concepts instead of revising only through linear notes.
