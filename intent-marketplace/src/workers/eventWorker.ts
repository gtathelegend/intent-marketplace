import { eventQueue, QueuedEvent } from "@/src/lib/queue";
import { generateAndStoreIntent } from "@/src/lib/intentEngine";
import { markEventProcessed, markEventFailed } from "@/src/lib/db";

async function processEvent(event: QueuedEvent): Promise<void> {
  console.log(`[Worker] Processing event ${event.event_id} from "${event.source}"...`);
  try {
    const intent = await generateAndStoreIntent(event.source, event.text);
    await markEventProcessed(event.event_id, intent.id);
    console.log(
      `[Worker] Intent stored: ${intent.id} — "${intent.intent_summary}"`
    );
  } catch (err) {
    console.error("[Worker] Failed to process event:", err);
    await markEventFailed(event.event_id).catch(() => {});
  }
}

/**
 * Start the event-driven worker. Idempotent — safe to call multiple times;
 * only the first call registers the listener.
 */
export function startWorker(): void {
  const g = globalThis as Record<string, unknown>;
  if (g.__workerStarted) return;
  g.__workerStarted = true;

  eventQueue.on("enqueued", (event: QueuedEvent) => {
    processEvent(event);
  });

  console.log("[Worker] Event worker is running");
}
