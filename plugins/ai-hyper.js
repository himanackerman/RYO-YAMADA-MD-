import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Halo`,
      m
    )
  }

  try {
    let url = `${global.APIs.faa}/faa/ai-hyper?text=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let json = await res.json()

    if (!json.status) throw 'Gagal mengambil jawaban.'

    conn.reply(m.chat, json.result.trim(), m)
  } catch {
    conn.reply(m.chat, 'Terjadi kesalahan saat mengambil data.', m)
  }
}

handler.help = ['aihyper <text>']
handler.tags = ['ai']
handler.command = /^aihyper$/i
handler.premium = true
handler.limit = false

export default handler