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
    let res = await fetch(`${global.APIs.faa}/faa/gemini-ai?text=${encodeURIComponent(text)}`)
    let json = await res.json()

    if (!json.status) throw 'API error'

    conn.reply(m.chat, json.result.trim(), m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil jawaban.', m)
  }
}

handler.help = ['gemini']
handler.tags = ['ai']
handler.command =  /^(gemini)$/i
handler.limit = true

export default handler