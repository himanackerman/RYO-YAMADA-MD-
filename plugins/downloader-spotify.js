import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Untuk apa hindia`,
      m
    )
  }

  try {
    let api = `${global.APIs.faa}/faa/spotify-play?q=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'API error'

    let info = json.info
    let dl = json.download.url

    await conn.sendMessage(m.chat, {
      audio: { url: dl },
      mimetype: 'audio/mpeg',
      fileName: `${info.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: info.title,
          body: info.artist + ' • ' + info.album,
          thumbnailUrl: info.thumbnail,
          sourceUrl: info.spotify_url,
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

handler.help = ['spotify <judul lagu>']
handler.tags = ['downloader']
handler.command = /^spotify$/i
handler.limit = true

export default handler