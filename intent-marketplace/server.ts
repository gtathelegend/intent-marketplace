/**
 * Custom Next.js server with Socket.IO attached.
 *
 * Why a custom server?
 * Socket.IO requires access to the raw Node.js HTTP server, which is not
 * exposed through the Next.js App Router API route layer. Running both on
 * the same port/process avoids CORS complexity and keeps deployment simple.
 *
 * Start:  npm run dev  (or npm start in production)
 * Worker: npm run worker  (separate terminal)
 */
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import next from "next";
import { intentEmitter } from "./src/lib/intentEmitter";

const dev  = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

// Shape stored in PostgreSQL / emitted by the worker
interface StoredIntentPayload {
  id:               string;
  intent_summary:   string;
  possible_actions: string[];
  confidence:       number;
  reasoning:        string;
  source:           string;
  source_text?:     string;
  entities?:        string[];
  status?:          string;
  created_at?:      string;
}

// Minimal card shape expected by browser Socket.IO clients + SSE
interface IntentCard {
  id:              string;
  intent_summary:  string;
  proposed_action: string;
  confidence:      number;
  reasoning:       string;
  source:          string;
}

function toCard(intent: StoredIntentPayload): IntentCard {
  return {
    id:              intent.id,
    intent_summary:  intent.intent_summary,
    proposed_action: intent.possible_actions?.[0] ?? intent.intent_summary,
    confidence:      intent.confidence,
    reasoning:       intent.reasoning,
    source:          intent.source,
  };
}

async function main() {
  const app    = next({ dev, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const httpServer = createServer((req, res) => handle(req, res));

  const io = new SocketServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: "/socket.io",
  });

  // Store globally so getIO() in socket.ts can retrieve it
  (globalThis as Record<string, unknown>).__io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected:    ${socket.id}`);
    socket.on("disconnect", () =>
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`)
    );
  });

  // Note: real-time intent delivery is handled via SSE DB-polling
  // (GET /api/intents/stream). No Redis pub/sub subscriber needed here.

  httpServer.listen(port, () => {
    console.log(`\n> Next.js + Socket.IO ready on http://localhost:${port}`);
    console.log(`> Run the event worker in a separate terminal:`);
    console.log(`>   npm run worker\n`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
