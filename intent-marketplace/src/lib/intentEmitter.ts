import { EventEmitter } from "events";

// Global singleton — survives Next.js HMR reloads in dev mode.
declare global {
  // eslint-disable-next-line no-var
  var __intentEmitter: EventEmitter | undefined;
}

export const intentEmitter: EventEmitter =
  globalThis.__intentEmitter ??
  (globalThis.__intentEmitter = new EventEmitter());

// Allow many SSE connections to listen simultaneously
intentEmitter.setMaxListeners(200);
