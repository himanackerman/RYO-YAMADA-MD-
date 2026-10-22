let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Genit
${usedPrefix + command} https://music.apple.com/id/song/genit/535063959`)
  }

  await m.react('🕒')

  try {
    let url = text

    if (!/^https?:\/\/music\.apple\.com/i.test(text)) {
      const search = await fetch(
        `${global.APIs.nexray}/search/applemusic?q=${encodeURIComponent(text)}`
      )
      const s = await search.json()

      if (!s?.status || !s.result?.length) {
        await m.react('❌')
        return m.reply('❌ Lagu tidak ditemukan.')
      }

      const song = s.result.find(v => /^Song/i.test(v.subtitle)) || s.result[0]
      url = song.link
    }

    const res = await fetch(
      `${global.APIs.nexray}/downloader/applemusic?url=${encodeURIComponent(url)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ Gagal mengambil audio.')
    }

    const r = data.result

    const caption = `   *Apple Music Downloader*

✿ Title : ${r.name}
✿ Artist : ${r.artist}
✿ Album : ${r.album_name}
✿ Type : ${r.type}
✿ Duration : ${r.duration || '-'}`

    await conn.sendMessage(
      m.chat,
      {
        image: { url: r.thumbnail },
        caption
      },
      { quoted: m }
    )

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: r.url },
        mimetype: 'audio/mpeg',
        fileName: `${r.name}.mp3`
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['applemusic']
handler.tags = ['downloader']
handler.command = /^(applemusic|aplmusic|applemp3)$/i
handler.register = true
handler.limit = true

export default handler