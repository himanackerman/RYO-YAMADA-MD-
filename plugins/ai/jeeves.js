import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .jeeves Halo', m)
  }

  let url = `${global.APIs.faa}/faa/jeeves-ai?prompt=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  conn.reply(m.chat, json.result.trim(), m)
}

handler.help = ['jeeves']
handler.tags = ['ai']
handler.command = /^jeeves$/i
handler.limit = true

export default handler