let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Cara pakai:\n${usedPrefix + command} Nickname`)
  }

  try {
    const apiUrl = `https://api.nexray.web.id/maker/fakelobyff?nickname=${encodeURIComponent(text)}`

    const res = await fetch(apiUrl, {
      headers: { Accept: 'image/*' }
    })

    if (!res.ok) throw 'fetch error'

    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) throw 'invalid'

    const buffer = await res.arrayBuffer()

    await conn.sendMessage(m.chat, {
      image: Buffer.from(buffer),
      caption: `Fake Lobby FF\nNickname: ${text}`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Error')
  }
}

handler.help = ['fakeff']
handler.tags = ['maker']
handler.command = /^fakeff$/i
handler.limit = true
handler.register = true

export default handler