import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .gita Halo', m)
  }

  let url = `${global.APIs.faa}/faa/gita-ai?text=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  conn.reply(m.chat, json.result.trim(), m)
}

handler.help = ['gita']
handler.tags = ['ai']
handler.command = /^gita$/i
handler.limit = true

export default handler