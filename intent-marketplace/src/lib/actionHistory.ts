import type { ActionHistoryEntry } from "@/src/types/intent";

const STORAGE_KEY = "intent_action_history";

/**
 * Reads all stored action history entries from localStorage.
 * Returns an empty array when called server-side or if no entries exist.
 */
export function getActionHistory(): ActionHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActionHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Appends a new entry to the front of the persisted action history.
 * Caps history at 100 entries to avoid unbounded localStorage growth.
 */
export function appendActionHistory(entry: ActionHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getActionHistory();
    const updated = [entry, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable (e.g., private browsing quota)
  }
}

/**
 * Clears all stored action history.
 */
export function clearActionHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
