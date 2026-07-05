import pg from "pg"

const { Pool } = pg

const globalForNeon = globalThis as unknown as {
  neonPool?: pg.Pool
}

export function hasNeonDatabaseUrl(): boolean {
  return Boolean(process.env.NEON_DATABASE_URL?.trim())
}

export function getNeonPool(): pg.Pool {
  const connectionString = process.env.NEON_DATABASE_URL
  if (!connectionString) {
    throw new Error("NEON_DATABASE_URL is required")
  }

  if (!globalForNeon.neonPool) {
    globalForNeon.neonPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }

  return globalForNeon.neonPool
}
