let handler = async (m, { conn }) => {
  try {
    if (!m.quoted) {
      return m.reply('Reply pesan yang mau diambil JSON-nya')
    }

    let json = m.quoted?.msg || m.quoted?.message || m.quoted
    let result = JSON.stringify(json, null, 2)

    if (result.length > 4000) {
      return conn.sendFile(
        m.chat,
        Buffer.from(result),
        'message.json',
        '📦 JSON terlalu panjang, dikirim sebagai file',
        m
      )
    }

    m.reply(`📦 *QUOTED MESSAGE JSON*\n\n\`\`\`json\n${result}\n\`\`\``)

  } catch (e) {
    m.reply('❌ Error:\n' + e.message)
  }
}

handler.help = ['q']
handler.tags = ['owner']
handler.command = /^q$/i

handler.owner = true
handler.limit = false

export default handler