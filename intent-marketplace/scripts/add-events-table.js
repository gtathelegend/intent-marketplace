// scripts/add-events-table.js
// Run with: node scripts/add-events-table.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Connected to NeonDB. Running migration...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source      TEXT NOT NULL,
        text        TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processed', 'failed')),
        intent_id   UUID REFERENCES intents(id) ON DELETE SET NULL DEFAULT NULL,
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✓ events table ready");

    const { rows } = await client.query(
      "SELECT COUNT(*)::int AS count FROM events"
    );
    console.log(`✓ events rows: ${rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
