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
    let api = `${global.APIs.faa}/faa/soundcloud-play?query=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'Gagal mengambil lagu.'

    let data = json.result

    let audioRes = await fetch(data.download_url)
    let buffer = await audioRes.buffer()

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${data.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: data.title,
          body: data.user,
          thumbnailUrl: data.thumbnail,
          sourceUrl: data.source_url,
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

handler.help = ['soundcloud <judul>']
handler.tags = ['downloader']
handler.command = /^soundcloud$/i
handler.limit = true

export default handler