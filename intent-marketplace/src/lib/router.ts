import { generateEmbedding } from "@/src/lib/embeddings";

export interface RoutingResult {
  agent_id: string;
  name: string;
  score: number;
}

// Pre-defined agents — swap for a real DB lookup once pgvector is connected.
const AGENT_CONFIGS = [
  {
    agent_id: "calendar-agent",
    name: "Calendar Agent",
    description: "Schedules meetings, manages calendar events, and checks availability across time zones.",
  },
  {
    agent_id: "task-agent",
    name: "Task Agent",
    description: "Creates to-do lists, manages project tasks, sets deadlines, and tracks progress in productivity tools.",
  },
  {
    agent_id: "research-agent",
    name: "Research Agent",
    description: "Performs web searches, summarizes long articles, finds specific data points, and compiles reports.",
  },
  {
    agent_id: "email-agent",
    name: "Email Agent",
    description: "Drafts professional emails, organizes inboxes, filters spam, and sets up automated replies.",
  },
];

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export async function matchIntentToAgents(
  intentSummary: string
): Promise<RoutingResult[]> {
  const intentEmbedding = await generateEmbedding(intentSummary);

  const scored = await Promise.all(
    AGENT_CONFIGS.map(async (agent) => {
      const agentEmbedding = await generateEmbedding(agent.description);
      return {
        agent_id: agent.agent_id,
        name: agent.name,
        score: Math.max(0, cosineSimilarity(intentEmbedding, agentEmbedding)),
      };
    })
  );

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}
