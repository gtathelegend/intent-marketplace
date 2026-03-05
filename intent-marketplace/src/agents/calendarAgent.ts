export interface CalendarIntent {
  intent_summary: string;
  entities?: string[];
  proposed_action?: string;
}

export interface AgentResponse {
  status: "success" | "failure" | "pending";
  message: string;
  data?: any;
}

/**
 * Mock Calendar Agent
 * Simulates executing calendar-related actions based on extracted intents.
 */
export const CalendarAgent = {
  /**
   * Simulates execution of a calendar-related intent.
   */
  execute: async (intent: CalendarIntent | string): Promise<AgentResponse> => {
    // Normalize intent summary
    const summary = typeof intent === "string" ? intent : intent.intent_summary;
    const lowerSummary = summary.toLowerCase();

    console.log(`[CalendarAgent] Executing intent: "${summary}"`);

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock logic for different calendar actions
    if (lowerSummary.includes("schedule") || lowerSummary.includes("meeting") || lowerSummary.includes("calendar")) {
      return {
        status: "success",
        message: `Successfully scheduled: "${summary}"`,
        data: {
          event_id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          location: "Virtual Meeting Room",
        },
      };
    }

    if (lowerSummary.includes("check") || lowerSummary.includes("availability")) {
      return {
        status: "success",
        message: "You are free during the requested time slot.",
        data: {
          available: true,
        },
      };
    }

    return {
      status: "failure",
      message: "I understood the intent but don't have a specific handler for this calendar action yet.",
    };
  },
};

export default CalendarAgent;
