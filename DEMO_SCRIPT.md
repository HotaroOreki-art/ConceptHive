# ConceptHive Demo Script

## Problem Statement

Knowledge workers, students, and AI developers often deal with massive amounts of unstructured data—from lengthy study notes to complex research datasets. Scanning this raw text is inefficient because core relationships are hidden inside paragraphs. Whether you are a student trying to revise, or a developer trying to feed clean structure into an AI model, unstructured data is a major bottleneck.

ConceptHive solves this by transforming raw text into an interactive knowledge graph. For students, it provides a visual map to explore connected ideas. For professionals and AI researchers, it generates clean, structured data trees and relationship JSONs that can be used directly to train machine learning models and improve AI applications.

## 5-Minute Demo Flow

### 0:00-0:35 — Introduction

Hi, my project is called ConceptHive. It is an AI-powered knowledge graph builder for students, researchers, and AI developers.

The problem I am solving is that unstructured data—like study notes or deep research text—is linear and messy. ConceptHive converts raw text into a visual, structured graph. This helps students learn interactively, and it also provides AI developers with the pristine JSON data trees required to train machine learning models and RAG pipelines.

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

In short, ConceptHive replaces the friction of unstructured text with connected visual knowledge maps—serving both as an incredible revision tool for learners and a powerful data-structuring tool for AI developers.

## Short Viva Answer

ConceptHive is a React application that converts unstructured text into interactive knowledge graphs and structured dataset trees. It uses Supabase for authentication and persistence, a Vercel serverless API route for AI-based graph generation, and react-force-graph-2d for visualization. The main goal is to map complex relationships hidden in text, providing students with highly interactive study tools, and giving researchers and developers the structured JSON formats required for building advanced AI applications.
