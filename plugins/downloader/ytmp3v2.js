let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} https://youtu.be/ZAfAud_M_mg`,
      m
    )
  }

  try {
    let res = await fetch(`${global.APIs.faa}/faa/ytmp3?url=${encodeURIComponent(text)}`)
    let json = await res.json()

    if (!json.status) throw 'API error'

    let { title, thumbnail, duration, mp3 } = json.result

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `Title : ${title}\nDuration : ${duration}`
    }, { quoted: m })

    let head = await fetch(mp3, { method: 'HEAD' })
    let size = Number(head.headers.get('content-length') || 0)

    if (size > 50 * 1024 * 1024) {
      await conn.sendMessage(m.chat, {
        document: { url: mp3 },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        audio: { url: mp3 },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil audio.', m)
  }
}

handler.help = ['ytmp3v2 <url>']
handler.tags = ['downloader']
handler.command = /^ytmp3v2$/i
handler.limit = true

export default handler