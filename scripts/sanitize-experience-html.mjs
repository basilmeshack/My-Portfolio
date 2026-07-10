import 'dotenv/config'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { getNeonPool } = require('../lib/neon')
const { sanitizeRichTextContent } = require('../lib/html-sanitizer')

async function main() {
  const pool = getNeonPool()
  console.log('Fetching experiences...')
  const res = await pool.query('SELECT id, responsibilities_html, achievements_html FROM profile_experiences')
  let updated = 0
  for (const row of res.rows) {
    const id = row.id
    const resp = row.responsibilities_html || ''
    const ach = row.achievements_html || ''

    const newResp = sanitizeRichTextContent(resp)
    const newAch = sanitizeRichTextContent(ach)

    if (newResp !== resp || newAch !== ach) {
      await pool.query(
        'UPDATE profile_experiences SET responsibilities_html = $1, achievements_html = $2, modified_at = NOW() WHERE id = $3',
        [newResp, newAch, id],
      )
      updated++
      console.log(`Updated experience ${id}`)
    }
  }

  console.log(`Done. Updated ${updated} records.`)
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
