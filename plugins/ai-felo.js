import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .felo Apa itu bot wa', m)
  }

  let url = `${global.APIs.faa}/faa/feloai?text=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  let sumber = (json.sources || [])
    .slice(0, 5)
    .map((v, i) => `${i + 1}. ${v.title}\n${v.url}`)
    .join('\n\n')

  let hasil = `${json.result.trim()}\n\nSumber:\n${sumber}`

  conn.reply(m.chat, hasil, m)
}

handler.help = ['felo']
handler.tags = ['ai']
handler.command = /^felo$/i
handler.limit = true

export default handler