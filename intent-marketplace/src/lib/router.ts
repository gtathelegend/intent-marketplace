import { generateEmbedding } from "@/src/lib/embeddings";

export interface Agent {
  agent_id: string;
  name: string;
  description: string;
  capabilities: string[];
  embedding: number[];
}

export interface RoutingResult {
  agent: Agent;
  score: number;
}

/**
 * Calculates the cosine similarity between two vectors.
 * Range: [-1, 1], where 1 is identical, 0 is orthogonal, -1 is opposite.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    console.error("Vector dimensions do not match");
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

/**
 * Matches an intent summary to a list of agents based on vector similarity.
 * Returns the top 3 matching agents with their confidence scores.
 */
export async function matchIntentToAgents(
  intentSummary: string,
  agents: Agent[]
): Promise<RoutingResult[]> {
  // 1. Generate embedding for intent summary
  const intentEmbedding = await generateEmbedding(intentSummary);

  // 2. Compute similarity for each agent
  const results: RoutingResult[] = agents.map((agent) => {
    const score = cosineSimilarity(intentEmbedding, agent.embedding);
    return {
      agent,
      // Normalize score to 0-1 range if needed, though cosine similarity 
      // is already mostly in 0-1 for positive-leaning vectors
      score: Math.max(0, score), 
    };
  });

  // 3. Sort by score descending and return top 3
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
