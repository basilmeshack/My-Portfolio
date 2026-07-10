const fs = require('fs')
const text = fs.readFileSync('/tmp/experience_after_restart.html','utf8')
const needle = 'Contributing to ICT systems design'
const idx = text.indexOf(needle)
if (idx === -1) {
  console.log('Not found')
  process.exit(0)
}
const start = Math.max(0, idx - 200)
const end = Math.min(text.length, idx + 800)
console.log(text.slice(start, end))
