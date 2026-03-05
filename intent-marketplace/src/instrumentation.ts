/**
 * Next.js Instrumentation hook — runs once when the server process starts.
 * Use this to boot long-lived singletons like the event worker.
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startWorker } = await import("./workers/eventWorker");
    startWorker();
  }
}
