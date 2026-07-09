import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const DATABASE_URL = process.env.NEON_DATABASE_URL;

function normalizeConnectionString(raw) {
  try {
    const url = new URL(raw);
    const sslMode = url.searchParams.get("sslmode");

    if (!sslMode || sslMode === "require" || sslMode === "prefer" || sslMode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return raw;
  }
}

if (!DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL is required. Add it to your .env file.");
}

const normalizedDatabaseUrl = normalizeConnectionString(DATABASE_URL);

const pool = new Pool({
  connectionString: normalizedDatabaseUrl,
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
        (SELECT COUNT(*) FROM portfolio_item_tags) AS portfolio_item_tags_count,
        (SELECT COUNT(*) FROM profile_contact_channels) AS profile_contact_channels_count,
        (SELECT COUNT(*) FROM assistant_knowledge_documents) AS assistant_knowledge_documents_count,
        (SELECT COUNT(*) FROM assistant_knowledge_documents WHERE embedding IS NOT NULL) AS assistant_knowledge_embeddings_count
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
