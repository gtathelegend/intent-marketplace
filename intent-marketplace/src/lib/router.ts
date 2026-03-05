import { db } from "@/src/lib/db";
import { generateEmbedding } from "@/src/lib/embeddings";

export interface Agent {
  agent_id: string;
  name: string;
  description: string;
  capabilities: string[];
  score?: number;
}

/**
 * Matches an intent summary to a list of agents based on pgvector similarity.
 */
export async function matchIntentToAgents(
  intentSummary: string
): Promise<Agent[]> {
  // 1. Generate embedding for intent summary
  const intentEmbedding = await generateEmbedding(intentSummary);
  
  // Format vector for pg: "[0.1, 0.2, ...]"
  const vectorStr = `[${intentEmbedding.join(',')}]`;

  // 2. Query agents table using cosine similarity (1 - (vector <=> vector))
  // pgvector <=> is Euclidean distance, <=> 1 - cosine similarity
  // Using cosine similarity (1 - (a <=> b)):
  const result = await db.query<Agent & { score: number }>(
    `SELECT 
      agent_id, 
      name, 
      description, 
      capabilities,
      (1 - (embedding <=> $1)) as score
     FROM agents
     ORDER BY score DESC
     LIMIT 3`,
    [vectorStr]
  );

  return result.rows;
}
