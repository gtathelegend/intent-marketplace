/**
 * Generates a deterministic hash for a string.
 * Based on the sdbm algorithm.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
  }
  return hash;
}

/**
 * Simple pseudo-random number generator (LCG).
 */
function seededRandom(seed: number) {
  const m = 2 ** 31 - 1;
  const a = 1103515245;
  const c = 12345;
  let state = seed;

  return function () {
    state = (a * state + c) % m;
    return state / m;
  };
}

/**
 * Generates a deterministic "simulated" embedding for a given text.
 * Returns a vector of length 384.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const length = 384;
  const seed = hashString(text);
  const random = seededRandom(seed);

  const embedding: number[] = [];
  for (let i = 0; i < length; i++) {
    // Generate values between -1 and 1
    embedding.push(random() * 2 - 1);
  }

  // Normalize the vector (optional but common for embeddings)
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  
  return embedding.map((val) => val / magnitude);
}
