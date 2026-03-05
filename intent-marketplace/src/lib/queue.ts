import Redis from "ioredis";

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
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

function makeClient(name: string): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });
  client.on("connect", () => console.log(`[Redis:${name}] Connected to ${REDIS_URL}`));
  client.on("error",   (err: Error) => console.error(`[Redis:${name}] ${err.message}`));
  return client;
}

// Use separate client instances so BRPOP doesn't block LPUSH.
declare global {
  // eslint-disable-next-line no-var
  var __redisEnqueue: Redis | undefined;
  // eslint-disable-next-line no-var
  var __redisDequeue: Redis | undefined;
}

const enqueueClient: Redis =
  globalThis.__redisEnqueue ?? (globalThis.__redisEnqueue = makeClient("enqueue"));
const dequeueClient: Redis =
  globalThis.__redisDequeue ?? (globalThis.__redisDequeue = makeClient("dequeue"));

/**
 * Push an event onto the Redis list (LPUSH).
 */
export async function enqueueEvent(event: QueuedEvent): Promise<void> {
  await enqueueClient.lpush(QUEUE_KEY, JSON.stringify(event));
  console.log(`[Queue] Enqueued event ${event.event_id}`);
}

/**
 * Blocking-pop an event (BRPOP). Returns null when the timeout expires.
 * timeoutSeconds = 0 means block indefinitely.
 */
export async function dequeueEvent(timeoutSeconds = 1): Promise<QueuedEvent | null> {
  const result = await dequeueClient.brpop(QUEUE_KEY, timeoutSeconds);
  if (!result) return null;
  try {
    return JSON.parse(result[1]) as QueuedEvent;
  } catch {
    console.error("[Queue] Malformed event payload:", result[1]);
    return null;
  }
}

/**
 * Returns the current length of the queue (for diagnostics).
 */
export async function queueLength(): Promise<number> {
  return enqueueClient.llen(QUEUE_KEY);
}

// ---------------------------------------------------------------------------
// Redis Pub/Sub bridge — worker publishes, Next.js server subscribes.
// Using separate client instances (ioredis requirement).
// ---------------------------------------------------------------------------

const INTENT_CHANNEL = "intents:new";

declare global {
  // eslint-disable-next-line no-var
  var __redisPub: Redis | undefined;
}

const pubClient: Redis =
  globalThis.__redisPub ?? (globalThis.__redisPub = makeClient("publish"));

/**
 * Publish a newly stored intent to the "intents:new" Redis channel.
 * Called by the worker after persisting to PostgreSQL.
 */
export async function publishIntent(intent: unknown): Promise<void> {
  await pubClient.publish(INTENT_CHANNEL, JSON.stringify(intent));
}

/**
 * Subscribe to the "intents:new" channel.
 * Calls `onIntent` for each received message.
 * Returns a cleanup function that unsubscribes and quits the subscriber client.
 */
export function subscribeToIntents(
  onIntent: (intent: unknown) => void
): () => void {
  const sub = makeClient("subscribe");

  sub.subscribe(INTENT_CHANNEL, (err) => {
    if (err) console.error("[Redis:subscribe] Subscribe failed:", err);
    else     console.log(`[Redis:subscribe] Listening on channel "${INTENT_CHANNEL}"`);
  });

  sub.on("message", (channel, message) => {
    if (channel !== INTENT_CHANNEL) return;
    try {
      onIntent(JSON.parse(message));
    } catch {
      console.error("[Redis:subscribe] Malformed intent payload:", message);
    }
  });

  return () => {
    sub.unsubscribe(INTENT_CHANNEL).catch(() => {});
    sub.quit().catch(() => {});
  };
}
