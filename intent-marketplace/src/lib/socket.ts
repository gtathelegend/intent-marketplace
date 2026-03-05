import { Server as SocketServer } from "socket.io";
import type { Server as HTTPServer } from "http";

declare global {
  // eslint-disable-next-line no-var
  var __io: SocketServer | undefined;
}

/**
 * Attach a Socket.IO server to a Node.js HTTP server and store it globally.
 * Safe to call multiple times — subsequent calls return the existing instance.
 */
export function initSocket(httpServer: HTTPServer): SocketServer {
  if (globalThis.__io) return globalThis.__io;

  const io = new SocketServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: "/socket.io",
  });

  globalThis.__io = io;
  return io;
}

/**
 * Retrieve the running Socket.IO server instance.
 * Returns null if the server has not been initialised yet.
 */
export function getIO(): SocketServer | null {
  return globalThis.__io ?? null;
}
