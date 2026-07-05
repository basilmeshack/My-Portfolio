import fs from "node:fs";
import path from "node:path";
import PocketBase from "pocketbase";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const POCKETBASE_URL = process.env.POCKETBASE_URL || "https://remain-faceghost.pockethost.io";
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || "";
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "";
const DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL is required. Add it to your .env file.");
}

const pb = new PocketBase(POCKETBASE_URL);
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function normalizeList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // The value is not JSON; treat it as comma-separated text.
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toTimestamp(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function runSchemaMigration(client) {
  const migrationsDir = path.resolve("db/migrations");
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  for (const migrationFile of migrationFiles) {
    const migrationPath = path.join(migrationsDir, migrationFile);
    const sql = fs.readFileSync(migrationPath, "utf8");
    await client.query(sql);
  }
}

async function authenticatePocketBase() {
  if (!POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
    console.log("PocketBase admin credentials not provided; attempting public collection access...");
    return;
  }

  await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
  console.log("Authenticated to PocketBase as admin.");
}

async function getCollectionRecords(collectionName) {
  try {
    const records = await pb.collection(collectionName).getFullList({ sort: "created" });
    console.log(`Read ${records.length} records from PocketBase collection: ${collectionName}`);
    return records;
  } catch (error) {
    if (error && error.status === 404) {
      console.warn(`Collection '${collectionName}' not found or not publicly readable. Continuing without it.`);
      return [];
    }
    throw error;
  }
}

function choosePrimaryProfile(portfolioItems) {
  const profileItems = portfolioItems.filter((item) => String(item.field || "").toLowerCase() === "profile");
  if (profileItems.length === 0) {
    return null;
  }

  return profileItems.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())[0];
}

function isProjectLikePortfolioItem(item) {
  const fieldType = String(item.field || "").toLowerCase();
  if (fieldType === "projects") {
    return true;
  }

  if (!fieldType) {
    return Boolean(item.name && (item.tags || item.demoLink || item.isCompanyProject));
  }

  return false;
}

async function upsertProfile(client, profileRecord) {
  const result = await client.query(
    `
      INSERT INTO profiles (
        source_pb_id,
        full_name,
        location,
        phone,
        email,
        linkedin_url,
        summary,
        created_at,
        updated_at,
        raw_payload,
        modified_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()
      )
      ON CONFLICT (source_pb_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        location = EXCLUDED.location,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        linkedin_url = EXCLUDED.linkedin_url,
        summary = EXCLUDED.summary,
        created_at = EXCLUDED.created_at,
        updated_at = EXCLUDED.updated_at,
        raw_payload = EXCLUDED.raw_payload,
        modified_at = NOW()
      RETURNING id
    `,
    [
      String(profileRecord.id),
      profileRecord.full_name ?? profileRecord.name ?? null,
      profileRecord.location ?? null,
      profileRecord.phone ?? null,
      profileRecord.email ?? null,
      profileRecord.linkedin_url ?? null,
      profileRecord.summary ?? profileRecord.description ?? null,
      toTimestamp(profileRecord.created),
      toTimestamp(profileRecord.updated),
      profileRecord,
    ]
  );

  return result.rows[0].id;
}

async function upsertProject(client, projectRecord, profileId) {
  const imageFileName = projectRecord.image ?? null;
  const imageUrl = imageFileName ? pb.files.getURL(projectRecord, imageFileName) : null;

  const result = await client.query(
    `
      INSERT INTO projects (
        source_pb_id,
        profile_id,
        title,
        description,
        link,
        github,
        demo,
        image_file_name,
        image_url,
        created_at,
        updated_at,
        raw_payload,
        modified_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()
      )
      ON CONFLICT (source_pb_id)
      DO UPDATE SET
        profile_id = EXCLUDED.profile_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        link = EXCLUDED.link,
        github = EXCLUDED.github,
        demo = EXCLUDED.demo,
        image_file_name = EXCLUDED.image_file_name,
        image_url = EXCLUDED.image_url,
        created_at = EXCLUDED.created_at,
        updated_at = EXCLUDED.updated_at,
        raw_payload = EXCLUDED.raw_payload,
        modified_at = NOW()
      RETURNING id
    `,
    [
      String(projectRecord.id),
      profileId,
      projectRecord.title ?? projectRecord.name ?? null,
      projectRecord.description ?? null,
      projectRecord.link ?? projectRecord.url ?? null,
      projectRecord.github ?? null,
      projectRecord.demo ?? projectRecord.demoLink ?? null,
      imageFileName,
      imageUrl,
      toTimestamp(projectRecord.created),
      toTimestamp(projectRecord.updated),
      projectRecord,
    ]
  );

  return result.rows[0].id;
}

async function upsertDerivedProjectFromPortfolioItem(client, itemRecord, profileId) {
  const imageFileName = itemRecord.image ?? null;
  const imageUrl = imageFileName ? pb.files.getURL(itemRecord, imageFileName) : null;

  const result = await client.query(
    `
      INSERT INTO projects (
        source_pb_id,
        profile_id,
        title,
        description,
        link,
        github,
        demo,
        image_file_name,
        image_url,
        created_at,
        updated_at,
        raw_payload,
        modified_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()
      )
      ON CONFLICT (source_pb_id)
      DO UPDATE SET
        profile_id = EXCLUDED.profile_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        link = EXCLUDED.link,
        github = EXCLUDED.github,
        demo = EXCLUDED.demo,
        image_file_name = EXCLUDED.image_file_name,
        image_url = EXCLUDED.image_url,
        created_at = EXCLUDED.created_at,
        updated_at = EXCLUDED.updated_at,
        raw_payload = EXCLUDED.raw_payload,
        modified_at = NOW()
      RETURNING id
    `,
    [
      `portfolio:${String(itemRecord.id)}`,
      profileId,
      itemRecord.name ?? null,
      itemRecord.description ?? null,
      itemRecord.url ?? null,
      null,
      itemRecord.demoLink ?? null,
      imageFileName,
      imageUrl,
      toTimestamp(itemRecord.created),
      toTimestamp(itemRecord.updated),
      itemRecord,
    ]
  );

  return result.rows[0].id;
}

async function replaceProjectList(client, tableName, columnName, projectId, values) {
  await client.query(`DELETE FROM ${tableName} WHERE project_id = $1`, [projectId]);

  for (const value of values) {
    await client.query(
      `INSERT INTO ${tableName} (project_id, ${columnName}) VALUES ($1, $2) ON CONFLICT (project_id, ${columnName}) DO NOTHING`,
      [projectId, value]
    );
  }
}

async function upsertPortfolioItem(client, itemRecord, profileId, projectId) {
  const imageFileName = itemRecord.image ?? null;
  const imageUrl = imageFileName ? pb.files.getURL(itemRecord, imageFileName) : null;

  const result = await client.query(
    `
      INSERT INTO portfolio_items (
        source_pb_id,
        project_id,
        profile_id,
        field_type,
        category,
        name,
        description,
        url,
        demo_link,
        image_file_name,
        image_url,
        is_company_project,
        coming_soon,
        created_at,
        updated_at,
        raw_payload,
        modified_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW()
      )
      ON CONFLICT (source_pb_id)
      DO UPDATE SET
        project_id = EXCLUDED.project_id,
        profile_id = EXCLUDED.profile_id,
        field_type = EXCLUDED.field_type,
        category = EXCLUDED.category,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        url = EXCLUDED.url,
        demo_link = EXCLUDED.demo_link,
        image_file_name = EXCLUDED.image_file_name,
        image_url = EXCLUDED.image_url,
        is_company_project = EXCLUDED.is_company_project,
        coming_soon = EXCLUDED.coming_soon,
        created_at = EXCLUDED.created_at,
        updated_at = EXCLUDED.updated_at,
        raw_payload = EXCLUDED.raw_payload,
        modified_at = NOW()
      RETURNING id
    `,
    [
      String(itemRecord.id),
      projectId,
      profileId,
      itemRecord.field ?? null,
      itemRecord.category ?? null,
      itemRecord.name ?? null,
      itemRecord.description ?? null,
      itemRecord.url ?? null,
      itemRecord.demoLink ?? itemRecord.demo ?? null,
      imageFileName,
      imageUrl,
      itemRecord.isCompanyProject ?? null,
      itemRecord.comingSoon ?? null,
      toTimestamp(itemRecord.created),
      toTimestamp(itemRecord.updated),
      itemRecord,
    ]
  );

  return result.rows[0].id;
}

async function replacePortfolioTags(client, portfolioItemId, tags) {
  await client.query("DELETE FROM portfolio_item_tags WHERE portfolio_item_id = $1", [portfolioItemId]);

  for (const tag of tags) {
    await client.query(
      "INSERT INTO portfolio_item_tags (portfolio_item_id, tag_name) VALUES ($1, $2) ON CONFLICT (portfolio_item_id, tag_name) DO NOTHING",
      [portfolioItemId, tag]
    );
  }
}

async function migrate() {
  const client = await pool.connect();
  let migrationRunId = null;

  try {
    await runSchemaMigration(client);

    const runStart = await client.query(
      "INSERT INTO migration_runs (status, details) VALUES ($1, $2) RETURNING id",
      ["running", { source: "pocketbase", target: "neon" }]
    );
    migrationRunId = runStart.rows[0].id;

    await authenticatePocketBase();

    const profiles = await getCollectionRecords("profile");
    const projects = await getCollectionRecords("projects");
    const portfolioItems = await getCollectionRecords("portfolio_images");

    console.log(`Fetched ${profiles.length} profiles, ${projects.length} projects, and ${portfolioItems.length} portfolio items from PocketBase.`);

    await client.query("BEGIN");

    const profileMap = new Map();

    if (profiles.length === 0) {
      const primaryProfile = choosePrimaryProfile(portfolioItems);
      if (primaryProfile) {
        const syntheticProfile = {
          id: `portfolio:${primaryProfile.id}`,
          full_name: primaryProfile.name,
          summary: primaryProfile.description,
          created: primaryProfile.created,
          updated: primaryProfile.updated,
          source_field: "portfolio_images",
        };
        const profileId = await upsertProfile(client, syntheticProfile);
        profileMap.set(String(syntheticProfile.id), profileId);
      }
    }

    for (const profile of profiles) {
      const profileId = await upsertProfile(client, profile);
      profileMap.set(String(profile.id), profileId);
    }

    const projectMap = new Map();
    const projectNameMap = new Map();

    for (const project of projects) {
      const profileId = profileMap.get(String(project.profile)) ?? null;
      const projectId = await upsertProject(client, project, profileId);

      projectMap.set(String(project.id), projectId);
      if (project.title) {
        projectNameMap.set(String(project.title).toLowerCase(), projectId);
      }
      if (project.name) {
        projectNameMap.set(String(project.name).toLowerCase(), projectId);
      }

      const tools = normalizeList(project.tools_used);
      const aiTags = normalizeList(project.ai_tags ?? project.aiTags);

      await replaceProjectList(client, "project_tools", "tool_name", projectId, tools);
      await replaceProjectList(client, "project_tags", "tag_name", projectId, aiTags);
    }

    const fallbackProfileId = profileMap.values().next().value ?? null;
    for (const item of portfolioItems) {
      if (!isProjectLikePortfolioItem(item)) {
        continue;
      }

      const titleKey = item.name ? String(item.name).toLowerCase() : "";
      if (titleKey && projectNameMap.has(titleKey)) {
        continue;
      }

      const derivedProjectId = await upsertDerivedProjectFromPortfolioItem(client, item, fallbackProfileId);
      if (titleKey) {
        projectNameMap.set(titleKey, derivedProjectId);
      }

      const tools = normalizeList(item.tags);
      await replaceProjectList(client, "project_tools", "tool_name", derivedProjectId, tools);
    }

    for (const item of portfolioItems) {
      const fieldType = String(item.field || "").toLowerCase();
      let linkedProjectId = null;

      if (item.project) {
        linkedProjectId = projectMap.get(String(item.project)) ?? null;
      }

      if (!linkedProjectId && fieldType === "projects" && item.name) {
        linkedProjectId = projectNameMap.get(String(item.name).toLowerCase()) ?? null;
      }

      let profileId = null;
      if (item.profile) {
        profileId = profileMap.get(String(item.profile)) ?? null;
      } else if (fieldType === "profile") {
        profileId = fallbackProfileId;
      }

      const portfolioItemId = await upsertPortfolioItem(client, item, profileId, linkedProjectId);
      const tags = normalizeList(item.tags);
      await replacePortfolioTags(client, portfolioItemId, tags);
    }

    await client.query("COMMIT");

    const verification = await client.query(
      `
        SELECT
          (SELECT COUNT(*) FROM profiles) AS profiles_count,
          (SELECT COUNT(*) FROM projects) AS projects_count,
          (SELECT COUNT(*) FROM portfolio_items) AS portfolio_items_count,
          (SELECT COUNT(*) FROM project_tools) AS project_tools_count,
          (SELECT COUNT(*) FROM project_tags) AS project_tags_count,
          (SELECT COUNT(*) FROM portfolio_item_tags) AS portfolio_item_tags_count
      `
    );

    const counts = verification.rows[0];

    await client.query(
      "UPDATE migration_runs SET status = $1, finished_at = NOW(), details = $2 WHERE id = $3",
      ["success", { counts }, migrationRunId]
    );

    console.log("Migration completed successfully.");
    console.table(counts);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);

    if (migrationRunId) {
      await client.query(
        "UPDATE migration_runs SET status = $1, finished_at = NOW(), details = $2 WHERE id = $3",
        [
          "failed",
          {
            message: error instanceof Error ? error.message : "Unknown error",
          },
          migrationRunId,
        ]
      );
    }

    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
