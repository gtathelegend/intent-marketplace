import type { AgentExecutionResult } from "@/src/types/intent";

export interface TaskIntent {
  intent_summary: string;
  entities?: string[];
  proposed_action?: string;
}

/**
 * Mock Task Agent
 * Simulates creating tasks, setting deadlines, and managing to-do lists.
 */
export const TaskAgent = {
  execute: async (intent: TaskIntent | string): Promise<AgentExecutionResult> => {
    const summary = typeof intent === "string" ? intent : intent.intent_summary;
    const lowerSummary = summary.toLowerCase();

    console.log(`[TaskAgent] Executing intent: "${summary}"`);

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (lowerSummary.includes("remind") || lowerSummary.includes("reminder")) {
      return {
        status: "success",
        message: `Reminder set for: "${summary}"`,
        data: {
          task_id: Math.random().toString(36).substring(7),
          due: new Date(Date.now() + 86_400_000).toISOString(),
        },
      };
    }

    if (
      lowerSummary.includes("buy") ||
      lowerSummary.includes("grocery") ||
      lowerSummary.includes("shopping")
    ) {
      return {
        status: "success",
        message: `Added to your shopping list: "${summary}"`,
        data: { task_id: Math.random().toString(36).substring(7) },
      };
    }

    if (lowerSummary.includes("task") || lowerSummary.includes("todo") || lowerSummary.includes("to-do")) {
      return {
        status: "success",
        message: `Task created: "${summary}"`,
        data: {
          task_id: Math.random().toString(36).substring(7),
          created_at: new Date().toISOString(),
          priority: "medium",
        },
      };
    }

    // Generic task creation fallback
    return {
      status: "success",
      message: `Task queued via Task Agent: "${summary}"`,
      data: {
        task_id: Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
      },
    };
  },
};

