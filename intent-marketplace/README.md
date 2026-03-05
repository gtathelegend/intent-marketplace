# IntentOS — Intent → Action Marketplace

An AI-powered platform that transforms raw context (emails, Slack messages, notes) into structured, actionable intent cards — which you approve or reject with a swipe.

---

## What It Does

1. **Submit an event** — paste any text (email, Slack message, meeting note, reminder)
2. **AI extracts intent** — Groq LLM (Llama 3.3 70B) parses goals, entities, confidence, and a suggested action
3. **Worker queues & processes** — a standalone event worker polls Upstash Redis, calls the AI pipeline, and persists results to NeonDB
4. **Swipe to decide** — intent cards appear in real time via SSE; swipe right to execute, left to reject
5. **Agent executes** — a semantic router matches the intent to the best AI agent using cosine similarity on embeddings; the agent carries out the action
6. **History tracked** — all executions are logged to NeonDB and viewable in the Dashboard

---

## Features

### Core Pipeline
- **Intent Extraction** — Groq `llama-3.3-70b-versatile` with JSON-mode response, prompt injection sanitization, and confidence scoring (0–1)
- **Semantic Routing** — embeds both the intent and agent descriptions, routes to the highest cosine-similarity match
- **Event-Driven Architecture** — API → Upstash Redis queue → standalone worker → DB → SSE → UI
- **Real-time Intent Feed** — Server-Sent Events (SSE) via DB polling, compatible with Vercel serverless

### Agent Marketplace
| Agent | Capability |
|-------|-----------|
| Calendar Agent | Schedule meetings, manage events, check availability |
| Task Agent | Create to-dos, set deadlines, track progress |
| Research Agent | Web search, summarization, report compilation |
| Email Agent | Draft emails, organize inbox, automated replies |

### UI
- Light glassmorphism design (white/60 backdrop-blur cards, indigo accents)
- Floating glass pill NavBar
- Tinder-style swipe deck with confidence progress bar
- Double-confirm prompt for low-confidence cards (< 60%)
- SSE-powered real-time card injection
- Collapsible event submission form with source picker and char counter
- Activity dashboard with stats grid and filterable execution log table
- Fully mobile-responsive

### Infrastructure
- **NeonDB (PostgreSQL)** — `intents`, `events`, `executions` tables
- **Upstash Redis** — HTTP-based queue (LPUSH/RPOP), Vercel-compatible
- **Standalone Worker** — RPOP polling loop, runs separately on Railway or locally
- **Next.js App Router** — TypeScript, TailwindCSS v4, `src/` layout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4, framer-motion |
| Icons | lucide-react |
| AI / LLM | Groq SDK — `llama-3.3-70b-versatile` |
| Database | NeonDB (PostgreSQL via `pg`) |
| Queue | Upstash Redis (`@upstash/redis`) |
| Auth / APIs | Google APIs (Gmail) |
| Runtime | Node.js + tsx |

---

## Project Structure

```
intent-marketplace/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── intents/page.tsx          # Intent feed + swipe deck
│   │   ├── dashboard/page.tsx        # Execution history
│   │   └── api/
│   │       ├── events/route.ts       # POST — enqueue raw event
│   │       ├── execute/route.ts      # POST — execute a DB-backed intent
│   │       ├── execute-agent/route.ts # POST — run a named agent
│   │       ├── extract-intent/route.ts # POST — extract intent from text
│   │       ├── route-intent/route.ts  # POST — semantic agent routing
│   │       ├── intents/route.ts       # GET — list intent cards
│   │       ├── intents/[id]/route.ts  # PATCH — update intent status
│   │       ├── intents/stream/route.ts # GET — SSE real-time feed
│   │       └── gmail/sync/route.ts    # POST — Gmail sync
│   ├── agents/
│   │   ├── calendarAgent.ts
│   │   ├── emailAgent.ts
│   │   └── taskAgent.ts
│   ├── components/
│   │   ├── NavBar.tsx
│   │   ├── SwipeDeck.tsx
│   │   ├── EventSubmit.tsx
│   │   ├── Hero.tsx
│   │   ├── AgentCard.tsx
│   │   └── IntentCard.tsx
│   ├── lib/
│   │   ├── groq.ts          # Groq client singleton
│   │   ├── db.ts            # NeonDB helpers (logAction, getExecutions, insertIntent…)
│   │   ├── queue.ts         # Upstash Redis enqueue/dequeue
│   │   ├── intent.ts        # extractIntent() with sanitization
│   │   ├── embeddings.ts    # generateEmbedding()
│   │   ├── router.ts        # matchIntentToAgents() cosine similarity
│   │   └── gmail.ts         # Gmail OAuth helpers
│   ├── workers/
│   │   └── eventWorker.ts   # Standalone RPOP polling worker
│   └── types/
│       └── intent.ts
├── server.ts                # Custom Next.js + Socket.IO server (local dev)
└── vercel.json              # Vercel deployment config
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Groq
GROQ_API_KEY=your_groq_api_key

# NeonDB
DATABASE_URL=postgresql://...

# Upstash Redis
REDIS_URL=https://your-instance.upstash.io
REDIS_TOKEN=your_upstash_token

# Google (optional — Gmail sync)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (Next.js + Socket.IO)
npm run dev

# Run the event worker (separate terminal)
npm run worker
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running in Production

```bash
npm run build
npm run start       # Next.js production server

# Worker — run on a persistent host (e.g. Railway)
npm run worker
```

---

## Deployment (Vercel)

| Setting | Value |
|---------|-------|
| Root Directory | `intent-marketplace` |
| Build Command | `next build` (auto-detected) |
| Output Directory | `.next` (auto-detected) |

Add all environment variables under **Vercel Dashboard → Settings → Environment Variables**.

> The event worker must run as a separate persistent process (e.g. Railway free tier) — Vercel serverless functions cannot run long-lived loops. The SSE feed uses DB polling and works on Vercel without the worker.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/events` | Enqueue a raw event `{ source, text }` |
| `GET` | `/api/intents` | List all intent cards |
| `GET` | `/api/intents/stream` | SSE stream of new intent cards |
| `PATCH` | `/api/intents/[id]` | Update intent status |
| `POST` | `/api/execute` | Execute a DB-backed intent by `intent_id` |
| `POST` | `/api/execute-agent` | Run a named agent with an intent payload |
| `POST` | `/api/extract-intent` | Extract intent from arbitrary text |
| `POST` | `/api/route-intent` | Semantically route an intent to agents |
| `POST` | `/api/gmail/sync` | Sync Gmail messages |

---

## Database Schema

```sql
-- Intent cards produced by the AI pipeline
CREATE TABLE intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_summary TEXT,
  proposed_action TEXT,
  confidence FLOAT,
  reasoning TEXT,
  source TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raw incoming events (pre-processing)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT,
  text TEXT,
  status TEXT DEFAULT 'pending',  -- pending | processed | failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent execution results
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_summary TEXT,
  source_text TEXT,
  agent_name TEXT,
  status TEXT,       -- success | failed
  result_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

