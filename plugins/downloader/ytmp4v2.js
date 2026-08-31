let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} https://youtu.be/cii6ruuycQA`,
      m
    )
  }

  try {
    let res = await fetch(`${global.APIs.faa}/faa/ytmp4?url=${encodeURIComponent(text)}`)
    let json = await res.json()

    if (!json.status) throw 'API error'

    let video = json.result.download_url

    let head = await fetch(video, { method: 'HEAD' })
    let size = Number(head.headers.get('content-length') || 0)

    if (size > 50 * 1024 * 1024) {
      await conn.sendMessage(m.chat, {
        document: { url: video },
        mimetype: 'video/mp4',
        fileName: 'video.mp4'
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: video },
        mimetype: 'video/mp4'
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil video.', m)
  }
}

handler.help = ['ytmp4v2 <url>']
handler.tags = ['downloader']
handler.command = /^ytmp4v2$/i
handler.limit = true

export default handler