import pg from "pg"

const { Pool } = pg

const globalForNeon = globalThis as unknown as {
  neonPool?: pg.Pool
}

export function hasNeonDatabaseUrl(): boolean {
  return Boolean(process.env.NEON_DATABASE_URL?.trim())
}

function normalizeConnectionString(raw: string): string {
  try {
    const url = new URL(raw)
    const sslMode = url.searchParams.get("sslmode")

    if (!sslMode || sslMode === "require" || sslMode === "prefer" || sslMode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full")
    }

    return url.toString()
  } catch {
    return raw
  }
}

export function getNeonPool(): pg.Pool {
  const connectionString = process.env.NEON_DATABASE_URL
  if (!connectionString) {
    throw new Error("NEON_DATABASE_URL is required")
  }

  const normalizedConnectionString = normalizeConnectionString(connectionString)

  if (!globalForNeon.neonPool) {
    globalForNeon.neonPool = new Pool({
      connectionString: normalizedConnectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 15000,
      keepAlive: true,
      statement_timeout: 10000,
    })
  }

  return globalForNeon.neonPool
}
