import { EventEmitter } from "events";

export interface QueuedEvent {
  event_id: string; // DB row id in the events table
  source: string;
  text: string;
  timestamp: number;
}

class InMemoryQueue extends EventEmitter {
  private items: QueuedEvent[] = [];

  enqueue(event: QueuedEvent): void {
    this.items.push(event);
    this.emit("enqueued", event);
  }

  dequeue(): QueuedEvent | undefined {
    return this.items.shift();
  }

  get size(): number {
    return this.items.length;
  }
}

// Global singleton survives Next.js HMR
declare global {
  // eslint-disable-next-line no-var
  var __eventQueue: InMemoryQueue | undefined;
}

export const eventQueue: InMemoryQueue =
  globalThis.__eventQueue ?? (globalThis.__eventQueue = new InMemoryQueue());
