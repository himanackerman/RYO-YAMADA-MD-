import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `*Example :* ${usedPrefix + command} Siapa Ryo Yamada`,
      m
    )
  }

  let url = `${global.APIs.faa}/faa/powerbrain-ai?text=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  conn.reply(m.chat, json.result.trim(), m)
}

handler.help = ['powerbrain']
handler.tags = ['ai']
handler.command = /^powerbrain$/i
handler.limit = true

export default handler