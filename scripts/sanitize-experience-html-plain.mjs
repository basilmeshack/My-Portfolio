import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

function serverSideClean(html = '') {
  let cleaned = String(html)
  // Unwrap <p> around lists
  cleaned = cleaned.replace(/<p>\s*(<(?:ul|ol)[\s\S]*?<\/(?:ul|ol)>)\s*<\/p>/gi, '$1')
  // Unwrap divs inside p
  cleaned = cleaned.replace(/<p>\s*(<(?:div)[\s\S]*?<\/(?:div)>)\s*<\/p>/gi, '$1')
  // Replace sequences of br in p
  cleaned = cleaned.replace(/<p>\s*(<br\s*\/?>(?:\s*<br\s*\/?>)*)\s*<\/p>/gi, '$1')
  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '')
  // Normalize stray <p><div></div></p>
  cleaned = cleaned.replace(/<p>\s*(<[^>]+>\s*)+<\/p>/gi, (m) => m)
  return cleaned
}

async function main() {
  const connectionString = process.env.NEON_DATABASE_URL
  if (!connectionString) {
    console.error('NEON_DATABASE_URL not set')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const res = await client.query('SELECT id, responsibilities_html, achievements_html FROM profile_experiences')
    let updated = 0
    for (const row of res.rows) {
      const id = row.id
      const resp = row.responsibilities_html || ''
      const ach = row.achievements_html || ''
      const newResp = serverSideClean(resp)
      const newAch = serverSideClean(ach)
      if (newResp !== resp || newAch !== ach) {
        await client.query(
          'UPDATE profile_experiences SET responsibilities_html = $1, achievements_html = $2, modified_at = NOW() WHERE id = $3',
          [newResp, newAch, id]
        )
        updated++
        console.log('Updated', id)
      }
    }
    console.log('Done. Updated', updated, 'rows')
  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
