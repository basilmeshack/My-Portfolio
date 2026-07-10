import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.NEON_DATABASE_URL })

async function main() {
  const res = await pool.query("SELECT id, responsibilities_html, achievements_html FROM profile_experiences WHERE responsibilities_html ILIKE '%<ul%' OR responsibilities_html ILIKE '%<ol%' OR achievements_html ILIKE '%<ul%' OR achievements_html ILIKE '%<ol%'")
  console.log('rows:', res.rows.length)
  for (const r of res.rows) {
    console.log('ID', r.id)
    console.log((r.responsibilities_html || '').slice(0, 600).replace(/\n/g, ' '))
    console.log('---')
  }
  await pool.end()
}

main().catch((e)=>{console.error(e);process.exit(1)})
