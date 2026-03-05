import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Event shape shared between the API and the worker.
// ---------------------------------------------------------------------------
export interface QueuedEvent {
  event_id: string; // DB row id in the events table
  source: string;
  text: string;
  timestamp: number;
}

const QUEUE_KEY = "device_events";

// @upstash/redis reads REDIS_URL + REDIS_TOKEN from env automatically
const redis = new Redis({
  url:   process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

/**
 * Push an event onto the Redis list (LPUSH).
 */
export async function enqueueEvent(event: QueuedEvent): Promise<void> {
  await redis.lpush(QUEUE_KEY, JSON.stringify(event));
  console.log(`[Queue] Enqueued event ${event.event_id}`);
}

/**
 * Non-blocking pop. Returns null when the queue is empty.
 * (Upstash REST does not support blocking BRPOP — use polling instead.)
 */
export async function dequeueEvent(): Promise<QueuedEvent | null> {
  const raw = await redis.rpop<string>(QUEUE_KEY);
  if (!raw) return null;
  try {
    // Upstash may return an already-parsed object when the value is valid JSON
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed as QueuedEvent;
  } catch {
    console.error("[Queue] Malformed event payload:", raw);
    return null;
  }
}

/**
 * Returns the current length of the queue (for diagnostics).
 */
export async function queueLength(): Promise<number> {
  return redis.llen(QUEUE_KEY);
}
