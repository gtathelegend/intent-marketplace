import { extractIntent } from "@/src/lib/intent";
import { db } from "@/src/lib/db";
import { intentEmitter } from "@/src/lib/intentEmitter";

export interface StoredIntent {
  id: string;
  source: string;
  source_text: string;
  intent_summary: string;
  possible_actions: string[];
  entities: string[];
  confidence: number;
  reasoning: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/** Row shape returned by postgres before JSON is parsed */
interface RawIntentRow {
  id: string;
  source: string;
  source_text: string;
  intent_summary: string;
  possible_actions: string; // json text from ::text cast
  entities: string;         // json text from ::text cast
  confidence: number;
  reasoning: string;
  status: string;
  created_at: string;
}

const COLUMNS = `
  id, source, source_text, intent_summary,
  possible_actions::text, entities::text,
  confidence, reasoning, status, created_at::text
`;

function parseRow(row: RawIntentRow): StoredIntent {
  return {
    ...row,
    possible_actions:
      typeof row.possible_actions === "string"
        ? JSON.parse(row.possible_actions)
        : (row.possible_actions as unknown as string[]),
    entities:
      typeof row.entities === "string"
        ? JSON.parse(row.entities)
        : (row.entities as unknown as string[]),
    status: row.status as StoredIntent["status"],
  };
}

/**
 * Extract intent from raw text, persist it to the intents table, and
 * broadcast the new intent via SSE to all connected clients.
 */
export async function generateAndStoreIntent(
  source: string,
  text: string
): Promise<StoredIntent> {
  const extraction = await extractIntent(text);

  const row = await db.findOne<RawIntentRow>(
    `INSERT INTO intents
       (source, source_text, intent_summary, possible_actions, entities, confidence, reasoning)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7)
     RETURNING ${COLUMNS}`,
    [
      source,
      text,
      extraction.intent_summary,
      JSON.stringify(extraction.possible_actions),
      JSON.stringify(extraction.entities),
      extraction.confidence,
      extraction.reasoning,
    ]
  );

  const intent = parseRow(row!);
  intentEmitter.emit("new_intent", intent);
  return intent;
}

/** Retrieve a single intent by UUID. Returns null if not found. */
export async function getIntentById(id: string): Promise<StoredIntent | null> {
  const row = await db.findOne<RawIntentRow>(
    `SELECT ${COLUMNS} FROM intents WHERE id = $1`,
    [id]
  );
  return row ? parseRow(row) : null;
}

/** Update the lifecycle status of an intent. */
export async function updateIntentStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<void> {
  await db.query(`UPDATE intents SET status = $1 WHERE id = $2`, [status, id]);
}

/** Return the most recent pending intents (shown in the SwipeDeck). */
export async function getPendingIntents(): Promise<StoredIntent[]> {
  const result = await db.query<RawIntentRow>(
    `SELECT ${COLUMNS}
     FROM intents
     WHERE status = 'pending'
     ORDER BY created_at DESC
     LIMIT 20`
  );
  return result.rows.map(parseRow);
}
