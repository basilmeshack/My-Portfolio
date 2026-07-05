import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL is required. Add it to your .env file.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function verify() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM profiles) AS profiles_count,
        (SELECT COUNT(*) FROM projects) AS projects_count,
        (SELECT COUNT(*) FROM project_tools) AS project_tools_count,
        (SELECT COUNT(*) FROM project_tags) AS project_tags_count,
        (SELECT COUNT(*) FROM portfolio_items) AS portfolio_items_count,
        (SELECT COUNT(*) FROM portfolio_item_tags) AS portfolio_item_tags_count
    `);

    const latestMigration = await client.query(
      "SELECT id, started_at, finished_at, status, details FROM migration_runs ORDER BY id DESC LIMIT 1"
    );

    console.log("Neon data verification summary:");
    console.table(result.rows[0]);

    if (latestMigration.rows[0]) {
      console.log("Latest migration run:");
      console.table(latestMigration.rows);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch((error) => {
  console.error("Verification failed:", error);
  process.exitCode = 1;
});
