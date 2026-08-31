import fs from 'fs'
import path from 'path'

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `Contoh:\n${usedPrefix + command} brat`
  }

  const dir = './plugins'
  const results = []

  function scan(folder) {
    const files = fs.readdirSync(folder)

    for (const file of files) {
      const full = path.join(folder, file)
      const stat = fs.statSync(full)

      if (stat.isDirectory()) {
        scan(full)
      } else if (file.endsWith('.js')) {
        const data = fs.readFileSync(full, 'utf8')

        if (data.includes(text)) {
          results.push(full)
        }
      }
    }
  }

  scan(dir)

  if (!results.length) {
    return m.reply(`*\`Plugin Search\`*

✿ *\`Keyword\`* : ${text}
✿ *\`Total\`* : 0`)
  }

  const res = `*\`Plugin Search\`*

✿ *\`Keyword\`* : ${text}
✿ *\`Total\`* : ${results.length}

${results.map(v => `✿ ${v}`).join('\n')}`

  m.reply(res)
}

handler.help = ['cariplugin']
handler.tags = ['owner']
handler.command = /^(grepplugin|cariplugin|cari)$/i
handler.owner = true
handler.limit = false

export default handler