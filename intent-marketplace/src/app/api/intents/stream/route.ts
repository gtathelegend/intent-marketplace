import { db } from "@/src/lib/db";

// Never cache SSE responses
export const dynamic = "force-dynamic";

interface IntentRow {
  id: string;
  intent_summary: string;
  possible_actions: string; // JSON text
  confidence: number;
  reasoning: string;
  source: string;
  created_at: string;
}

function toCard(row: IntentRow) {
  let actions: string[] = [];
  try { actions = JSON.parse(row.possible_actions); } catch { /* empty */ }
  return {
    id:              row.id,
    intent_summary:  row.intent_summary,
    proposed_action: actions[0] ?? row.intent_summary,
    confidence:      row.confidence,
    reasoning:       row.reasoning,
    source:          row.source,
  };
}

/**
 * GET /api/intents/stream
 *
 * Server-Sent Events feed. Polls the DB every 3 seconds for intents created
 * after the connection was opened. Works on Vercel serverless + custom server.
 */
export async function GET(request: Request) {
  const encoder  = new TextEncoder();
  const openedAt = new Date().toISOString();
  let   lastSeen = openedAt;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try { controller.enqueue(encoder.encode(data)); }
        catch { /* client disconnected */ }
      };

      const poll = async () => {
        try {
          const result = await db.query<IntentRow>(
            `SELECT id, intent_summary, possible_actions::text, confidence,
                    reasoning, source, created_at::text AS created_at
             FROM intents
             WHERE created_at > $1
             ORDER BY created_at ASC`,
            [lastSeen]
          );
          for (const row of result.rows) {
            send(`data: ${JSON.stringify(toCard(row))}\n\n`);
            lastSeen = row.created_at; // advance cursor
          }
        } catch (err) {
          console.error("[SSE] DB poll error:", err);
        }
      };

      // Poll every 3 seconds
      const interval = setInterval(poll, 3_000);

      // Heartbeat every 20 s to keep the connection alive through proxies
      const heartbeat = setInterval(() => send(": ping\n\n"), 20_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "Connection":        "keep-alive",
    },
  });
}
