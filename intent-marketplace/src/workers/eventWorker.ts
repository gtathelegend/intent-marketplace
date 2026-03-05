/**
 * Standalone Event Worker
 *
 * Run with:  npm run worker
 *
 * This process:
 *  1. Connects to Redis and blocks on BRPOP ("device_events")
 *  2. Calls the Groq LLM to extract structured intent from the raw text
 *  3. Persists the intent to PostgreSQL (intents table)
 *  4. Updates the originating event row to status = "processed"
 *  5. Broadcasts the new intent to the Next.js server via Socket.IO
 *     → Server fans it out to all browser Socket.IO clients
 *     → Server also fires intentEmitter so SSE (SwipeDeck) is updated
 *
 * The worker continues running even when individual events fail.
 */
import "dotenv/config";
import { dequeueEvent } from "@/src/lib/queue";
import { extractIntent } from "@/src/lib/intent";
import {
  insertIntent,
  markEventProcessed,
  markEventFailed,
} from "@/src/lib/db";

// ---------------------------------------------------------------------------
// Process a single event
// ---------------------------------------------------------------------------
async function processEvent(event: {
  event_id: string;
  source: string;
  text: string;
  timestamp: number;
}): Promise<void> {
  console.log(`[Worker] Event received:  ${event.event_id} | source="${event.source}"`);

  try {
    // ── Step 1: Extract intent via Groq ───────────────────────────────────
    console.log("[Worker] Calling Groq...");
    const extraction = await extractIntent(event.text);
    console.log(`[Worker] Intent extracted: "${extraction.intent_summary}" (confidence=${extraction.confidence})`);

    // ── Step 2: Persist intent to PostgreSQL ──────────────────────────────
    const intent = await insertIntent({
      source:           event.source,
      source_text:      event.text,
      intent_summary:   extraction.intent_summary,
      possible_actions: extraction.possible_actions,
      entities:         extraction.entities,
      confidence:       extraction.confidence,
      reasoning:        extraction.reasoning,
    });
    console.log(`[Worker] Intent saved:    ${intent.id}`);

    // ── Step 3: Mark originating event as processed ───────────────────────
    await markEventProcessed(event.event_id, intent.id);
    console.log(`[Worker] Event marked processed`);

  } catch (err) {
    console.error("[Worker] Failed to process event:", err);
    try {
      await markEventFailed(event.event_id);
    } catch (dbErr) {
      console.error("[Worker] Could not mark event as failed:", dbErr);
    }
  }
}

// ---------------------------------------------------------------------------
// Main loop — polls Redis continuously
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log("[Worker] Worker started");
  console.log(`[Worker] Listening on Redis queue "device_events"...`);

  while (true) {
    try {
      const event = await dequeueEvent();

      if (!event) {
        // Queue empty — wait 1 s then poll again
        await new Promise((r) => setTimeout(r, 1_000));
        continue;
      }

      // Process asynchronously so the dequeue loop is never blocked by Groq/DB
      processEvent(event);

    } catch (err) {
      console.error("[Worker] Unexpected error in main loop:", err);
      // Brief pause before retrying to avoid a tight crash loop
      await new Promise((r) => setTimeout(r, 1_000));
    }
  }
}

main();

// Export startWorker so instrumentation.ts still compiles without error
export function startWorker(): void {
  // No-op — the standalone worker is started via `npm run worker`, not in-process.
}
