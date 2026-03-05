import { Pool, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = {
  /**
   * Main query helper
   */
  async query<T extends QueryResultRow>(text: string, params?: any[]) {
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  },
  
  /**
   * Helper for single row results
   */
  async findOne<T extends QueryResultRow>(text: string, params?: any[]) {
    const res = await this.query<T>(text, params);
    return res.rows[0] || null;
  },

  /**
   * Transaction helper
   */
  async getClient() {
    return await pool.connect();
  }
};

export default db;

// ---------------------------------------------------------------------------
// In-memory execution log (used when no real DB is configured)
// ---------------------------------------------------------------------------

export interface ExecutionLog {
  id: string;
  agent_name: string;
  intent_summary: string;
  status: "success" | "failed";
  result_message: string;
  source_text: string;
  executed_at: string;
}

// Module-level store — persists for the lifetime of the dev server process.
const executionStore: ExecutionLog[] = [];

export async function logAction(data: Omit<ExecutionLog, "id" | "executed_at">): Promise<ExecutionLog> {
  const entry: ExecutionLog = {
    ...data,
    id: Math.random().toString(36).substring(2, 9),
    executed_at: new Date().toISOString(),
  };
  executionStore.unshift(entry); // newest first
  console.log("[DB Log]", JSON.stringify(entry));
  return entry;
}

export function getExecutions(): ExecutionLog[] {
  return executionStore;
}

