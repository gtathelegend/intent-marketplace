import { NextResponse } from "next/server";
import { enqueueEvent, queueLength } from "@/src/lib/queue";
import { logEvent } from "@/src/lib/db";

/**
 * POST /api/events
 * Body: { source: string, text: string }
 *
 * Pipeline:
 *  1. Validate input
 *  2. Persist raw event to the `events` table (status = 'pending')
 *  3. Push into Redis queue for the standalone worker to consume
 *
 * The worker (npm run worker) picks up the event, calls Groq, stores the
 * resulting intent, and broadcasts via Socket.IO + SSE.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { source, text } = body as Record<string, unknown>;

  if (!source || typeof source !== "string" ||
      !text   || typeof text   !== "string") {
    return NextResponse.json(
      { error: "Both 'source' (string) and 'text' (string) are required" },
      { status: 400 }
    );
  }

  // 1. Log raw event to DB immediately (status = 'pending')
  const rawEvent = await logEvent(source, text);

  // 2. Push to Redis for async processing by the standalone worker
  try {
    await enqueueEvent({
      event_id:  rawEvent.id,
      source,
      text,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("[POST /api/events] Redis enqueue failed:", err);
    return NextResponse.json(
      { error: "Event logged but could not be queued — is Redis running?" },
      { status: 503 }
    );
  }

  const queued = await queueLength().catch(() => -1);

  return NextResponse.json({
    status:   "event_received",
    event_id: rawEvent.id,
    queued,
  });
}
