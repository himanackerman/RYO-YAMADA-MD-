import { promises as fs } from 'fs'
import syntaxError from 'syntax-error'
import path from 'path'

const dir = './lib/scrape'

let handler = async (m, { text, __dirname }) => {
if (!text) throw 'Nama file?\nContoh:\n.savescrape y2mate'

if (!m.quoted) throw 'Reply kode scrape'

const code = m.quoted.text
if (!code) throw 'Kode tidak terbaca'

const filename = text.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.js'
const filepath = path.join(dir, filename)

await fs.mkdir(dir, { recursive: true })

const error = syntaxError(code, filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true
})

if (error) throw error

await fs.writeFile(filepath, code)

m.reply(`✅ Scraper saved!

📁 ${filepath}

Import:
import { ${filename.replace('.js','')} } from '../../lib/scrape/${filename}'
`)
}

handler.help = ['savescrape']
handler.tags = ['owner']
handler.command = /^savescrape$/i
handler.owner = true

export default handler