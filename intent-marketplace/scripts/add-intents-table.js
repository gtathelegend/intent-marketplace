// scripts/add-intents-table.js
// Run with: node scripts/add-intents-table.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Connected to NeonDB. Running migrations...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS intents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source TEXT NOT NULL DEFAULT '',
        source_text TEXT NOT NULL DEFAULT '',
        intent_summary TEXT NOT NULL DEFAULT '',
        possible_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
        entities JSONB NOT NULL DEFAULT '[]'::jsonb,
        confidence FLOAT NOT NULL DEFAULT 0,
        reasoning TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✓ intents table ready");

    await client.query(`
      ALTER TABLE executions ADD COLUMN IF NOT EXISTS intent_id TEXT DEFAULT NULL;
    `);
    console.log("✓ intent_id column added to executions");

    const { rows } = await client.query(
      "SELECT COUNT(*)::int AS count FROM intents"
    );
    console.log(`✓ intents rows: ${rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
