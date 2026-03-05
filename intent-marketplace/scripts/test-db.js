require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });

async function main() {
  const ins = await pool.query(
    "INSERT INTO executions (agent_name, intent_summary, status, result_message, source_text) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    ["Calendar Agent", "Test: Meeting with Alex", "success", "Calendar event created", "Email"]
  );
  console.log("Inserted id:", ins.rows[0].id);
  const sel = await pool.query("SELECT COUNT(*) FROM executions");
  console.log("Total rows:", sel.rows[0].count);
  await pool.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
