// Run once to create the executions table in NeonDB
// Usage: node scripts/init-db.js
require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS executions (
      id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      agent_name     TEXT        NOT NULL,
      intent_summary TEXT        NOT NULL,
      status         TEXT        NOT NULL CHECK (status IN ('success','failed')),
      result_message TEXT        NOT NULL DEFAULT '',
      source_text    TEXT        NOT NULL DEFAULT '',
      executed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✓ executions table ready");
  await pool.end();
}

main().catch((err) => {
  console.error("DB init failed:", err.message);
  process.exit(1);
});
