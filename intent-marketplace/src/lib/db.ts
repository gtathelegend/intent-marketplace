import { Pool, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
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
// Persistent execution log — writes to and reads from NeonDB.
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

export async function logAction(
  data: Omit<ExecutionLog, "id" | "executed_at">
): Promise<ExecutionLog> {
  const result = await db.findOne<ExecutionLog>(
    `INSERT INTO executions (agent_name, intent_summary, status, result_message, source_text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.agent_name, data.intent_summary, data.status, data.result_message, data.source_text]
  );
  console.log("[DB Log] Saved execution:", result?.id);
  return result!;
}

export async function getExecutions(): Promise<ExecutionLog[]> {
  const result = await db.query<ExecutionLog>(
    `SELECT id, agent_name, intent_summary, status, result_message, source_text,
            executed_at::text AS executed_at
     FROM executions
     ORDER BY executed_at DESC
     LIMIT 100`
  );
  return result.rows;
}

