import type { AgentExecutionResult } from "@/src/types/intent";

export interface EmailIntent {
  intent_summary: string;
  entities?: string[];
  proposed_action?: string;
}

/**
 * Mock Email Agent
 * Simulates drafting, sending, or organizing emails based on extracted intents.
 */
export const EmailAgent = {
  execute: async (intent: EmailIntent | string): Promise<AgentExecutionResult> => {
    const summary = typeof intent === "string" ? intent : intent.intent_summary;
    const lowerSummary = summary.toLowerCase();

    console.log(`[EmailAgent] Executing intent: "${summary}"`);

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (lowerSummary.includes("reply") || lowerSummary.includes("respond")) {
      return {
        status: "success",
        message: `Draft reply created for: "${summary}"`,
        data: {
          draft_id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
        },
      };
    }

    if (lowerSummary.includes("send") || lowerSummary.includes("email") || lowerSummary.includes("mail")) {
      return {
        status: "success",
        message: `Email drafted and queued for: "${summary}"`,
        data: {
          message_id: Math.random().toString(36).substring(7),
          queued_at: new Date().toISOString(),
        },
      };
    }

    if (lowerSummary.includes("archive") || lowerSummary.includes("label") || lowerSummary.includes("organize")) {
      return {
        status: "success",
        message: `Inbox organized for: "${summary}"`,
        data: { archived_count: Math.floor(Math.random() * 10) + 1 },
      };
    }

    return {
      status: "success",
      message: `Email action processed: "${summary}"`,
    };
  },
};

