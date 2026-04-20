# ConceptHive
**Live Deployment**: [https://react-end-term-project-81snuiaer-amitanshu11235-1335s-projects.vercel.app/](https://react-end-term-project-81snuiaer-amitanshu11235-1335s-projects.vercel.app/)
**Video Link**:https://www.youtube.com/watch?v=yd5KeY4II6U

ConceptHive is an AI-powered knowledge graph builder. Users paste text, study notes, or complex datasets, and the app extracts key concepts and relationships using AI (OpenAI/Gemini). The result is elegantly rendered as an interactive data tree and node graph that can be explored through a honeycomb dashboard.

## Problem Statement

Knowledge workers, students, and researchers often collect massive amounts of unstructured data—ranging from lecture notes to complex research datasets. Scanning raw text or feeding unstructured blocks of information into analytical pipelines is inefficient because core concepts, dependencies, and relationships are hidden inside paragraphs.

ConceptHive solves this by transforming unstructured text into clean, structured, and interactive knowledge graphs. Not only does this help students structure their revision visually, but **the generated data trees and structural JSONs are pristine formatting for AI researchers.** This structural extraction provides the exact parsed dataset relationships needed to build and train AI models more precisely, feed context into RAG architectures, and map out huge texts cleanly.

## Target Users & Use Cases

- **Students & Learners:** Organizing notes from lectures into visual, scannable relationship maps for easier revision.
- **AI Researchers & Developers:** Processing large text feeds into structured data trees and graph JSONs to train ML models and improve context injection.
- **Data Analysts:** Anyone who wants a fast visual abstraction of complex documents without reading raw text.

## Features

- Supabase email/password signup and login
- Protected dashboard routes
- Notes input page with controlled form state
- Vercel serverless API route at `/api/generate-graph`
- OpenAI or Gemini structured JSON extraction for concepts and relationships
- Supabase Postgres persistence in the `graphs` table
- Local demo mode when Supabase config is missing
- Local graph fallback when the Vercel OpenAI function is unavailable
- Honeycomb dashboard for saved graphs
- Interactive `react-force-graph-2d` graph view with zoom, pan, drag, and node click details
- CRUD support: create graphs, read saved graphs, rename graph titles, and delete graphs
- Loading states, error states, and responsive dark UI

## Tech Stack

- React with Vite
- Tailwind CSS
- React Router
- Supabase Auth
- Supabase Postgres
- Vercel Functions
- OpenAI Responses API
- Gemini API support through the same Vercel route
- react-force-graph-2d

## React Concepts Used

- Functional components
- Props and component composition
- `useState` for forms, loading states, and selected graph nodes
- `useEffect` for auth state, graph loading, and canvas sizing
- Conditional rendering for auth, loading, empty, and error states
- Lists and keys for graph cards, stats, and node neighbors
- Lifting state up through shared page/component state
- Controlled components for login, signup, graph title, and notes input
- React Router protected routes
- Context API for auth and active graph state
- `useMemo` for dashboard stats and graph normalization
- `useCallback` for stable handlers
- `useRef` for textarea focus and graph canvas access
- `React.lazy` and `Suspense` for route and graph component loading

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

3. Add Supabase frontend config if you want real backend persistence:

   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

4. Add OpenAI server-side config:

   ```env
   OPENAI_API_KEY=...
   OPENAI_MODEL=gpt-5-mini
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.5-flash
   AI_PROVIDER=gemini
   ```

5. In Supabase, enable Email authentication. For class demos, turn off email confirmation so signup logs in immediately. If email confirmation stays on, set the Auth URL Configuration Site URL to your dev URL and allow that URL in Redirect URLs.

6. Open Supabase SQL Editor and run `supabase.schema.sql`.

7. Run locally:

   ```bash
   npm run dev
   ```

   If Supabase values are not present, the app opens directly in local demo mode. Saved graphs are
   stored in the browser's localStorage.

   For local testing of the Vercel function, use Vercel's local development command:

   ```bash
   vercel dev
   ```

## Deployment

Deploy on Vercel and add these environment variables in the Vercel project settings:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `AI_PROVIDER`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase Shape

The `graphs` table stores:

```js
{
  id: "uuid",
  user_id: "auth user uuid",
  title: "React Fundamentals",
  notes: "Original pasted notes...",
  nodes: [{ id: "React" }],
  links: [{ source: "React", target: "Components" }],
  created_at,
  updated_at
}
```

## Demo Video Outline

1. Explain the problem: unstructured notes are hard to revise.
2. Show signup/login and protected routes.
3. Paste notes and generate a graph.
4. Open the honeycomb dashboard.
5. Explore graph interactions and node details.
6. Show Supabase persistence and explain why the OpenAI key is server-side only.

See `DEMO_SCRIPT.md` for a complete 5-minute narration script.

## Future Improvements

- AI-generated concept summaries
- Graph clustering by topic
- PDF upload
- Revision quizzes from graph nodes
- Spaced repetition reminders
