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

// ---------------------------------------------------------------------------
// Raw event log — persists every incoming POST /api/events payload.
// ---------------------------------------------------------------------------

export interface RawEventLog {
  id: string;
  source: string;
  text: string;
  status: "pending" | "processed" | "failed";
  intent_id: string | null;
  received_at: string;
}

export async function logEvent(
  source: string,
  text: string
): Promise<RawEventLog> {
  const row = await db.findOne<RawEventLog>(
    `INSERT INTO events (source, text)
     VALUES ($1, $2)
     RETURNING id, source, text, status, intent_id, received_at::text AS received_at`,
    [source, text]
  );
  console.log("[DB] Raw event logged:", row?.id);
  return row!;
}

export async function markEventProcessed(
  eventId: string,
  intentId: string
): Promise<void> {
  await db.query(
    `UPDATE events SET status = 'processed', intent_id = $1 WHERE id = $2`,
    [intentId, eventId]
  );
}

export async function markEventFailed(eventId: string): Promise<void> {
  await db.query(`UPDATE events SET status = 'failed' WHERE id = $1`, [eventId]);
}

// ---------------------------------------------------------------------------
// Intents table helpers — used by the standalone worker and API routes.
// ---------------------------------------------------------------------------

export interface StoredIntentInput {
  source: string;
  source_text: string;
  intent_summary: string;
  possible_actions: string[];
  entities: string[];
  confidence: number;
  reasoning: string;
}

interface RawIntentRow {
  id: string;
  source: string;
  source_text: string;
  intent_summary: string;
  possible_actions: string;
  entities: string;
  confidence: number;
  reasoning: string;
  status: string;
  created_at: string;
}

function parseIntentRow(row: RawIntentRow) {
  return {
    ...row,
    possible_actions: typeof row.possible_actions === "string"
      ? JSON.parse(row.possible_actions) as string[]
      : row.possible_actions as unknown as string[],
    entities: typeof row.entities === "string"
      ? JSON.parse(row.entities) as string[]
      : row.entities as unknown as string[],
  };
}

const INTENT_COLS = `
  id, source, source_text, intent_summary,
  possible_actions::text, entities::text,
  confidence, reasoning, status, created_at::text AS created_at
`;

/**
 * Insert a new intent row and return the full persisted record.
 */
export async function insertIntent(data: StoredIntentInput) {
  const row = await db.findOne<RawIntentRow>(
    `INSERT INTO intents
       (source, source_text, intent_summary, possible_actions, entities, confidence, reasoning)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7)
     RETURNING ${INTENT_COLS}`,
    [
      data.source,
      data.source_text,
      data.intent_summary,
      JSON.stringify(data.possible_actions),
      JSON.stringify(data.entities),
      data.confidence,
      data.reasoning,
    ]
  );
  if (!row) throw new Error("insertIntent: no row returned");
  return parseIntentRow(row);
}

/**
 * Return the most recent intents from the database.
 */
export async function getIntents(limit = 20) {
  const result = await db.query<RawIntentRow>(
    `SELECT ${INTENT_COLS}
     FROM intents
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map(parseIntentRow);
}

