// Core intent extraction output
export interface IntentExtractionResult {
  intent_summary: string;
  entities: string[];
  possible_actions: string[];
  confidence: number;
  reasoning: string;
}

// A single intent card shown in the swipe deck
export interface IntentCardData {
  id: string;
  intent_summary: string;
  proposed_action: string;
  confidence: number;
  reasoning: string;
  source: string;
}

// Agent routing match
export interface AgentMatch {
  name: string;
  confidence: number;
}

// Agent execution result
export interface AgentExecutionResult {
  status: "success" | "failure" | "pending";
  message: string;
  data?: Record<string, unknown>;
}

// An entry logged in action history
export interface ActionHistoryEntry {
  id: string;
  intent: string;
  agent: string;
  timestamp: string;
  status: "Approved" | "Rejected";
  source: string;
  confidence: number;
}
