import { NextResponse } from "next/server";
import { eventQueue } from "@/src/lib/queue";
import { startWorker } from "@/src/workers/eventWorker";
import { logEvent } from "@/src/lib/db";

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

  // 1. Persist raw event to DB immediately
  const rawEvent = await logEvent(source, text);

  // 2. Ensure worker is running (fallback if instrumentation hook didn't fire)
  startWorker();

  // 3. Enqueue for async processing (carries DB id so worker can close the loop)
  eventQueue.enqueue({ event_id: rawEvent.id, source, text, timestamp: Date.now() });

  return NextResponse.json({
    status: "event_received",
    event_id: rawEvent.id,
    queued: eventQueue.size,
  });
}
