/**
 * Next.js Instrumentation hook.
 *
 * The event worker is now a standalone process started via `npm run worker`.
 * This hook is intentionally a no-op — no in-process worker is needed.
 */
export async function register() {
  // Worker is standalone — see src/workers/eventWorker.ts and `npm run worker`
}
