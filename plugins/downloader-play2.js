import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Swim chase atlantic`,
      m
    )
  }

  try {
    let api = `${global.APIs.faa}/faa/ytplay?query=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'API error'

    let data = json.result

    await conn.sendMessage(m.chat, {
      audio: { url: data.mp3 },
      mimetype: 'audio/mpeg',
      fileName: `${data.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: data.title,
          body: `${data.author} • ${data.views} views`,
          thumbnailUrl: data.thumbnail,
          sourceUrl: data.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil audio.', m)
  }
}

handler.help = ['play2 <judul lagu>']
handler.tags = ['downloader']
handler.command = /^play2$/i
handler.limit = true

export default handler