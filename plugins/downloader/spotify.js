let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Swim Chase Atlantic
${usedPrefix + command} https://open.spotify.com/track/3M0lSi5WW79CXQamgSBIjx`)
  }

  await m.react('🕒')

  try {
    let url = text

    if (!/^https?:\/\/open\.spotify\.com\/track\//i.test(text)) {
      const search = await fetch(
        `${global.APIs.nexray}/search/spotify?q=${encodeURIComponent(text)}`
      )
      const s = await search.json()

      if (!s?.status || !s.result?.length) {
        await m.react('❌')
        return m.reply('❌ Lagu tidak ditemukan.')
      }

      url = s.result[0].url
    }

    const res = await fetch(
      `${global.APIs.nexray}/downloader/spotify?url=${encodeURIComponent(url)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ Gagal mengunduh lagu.')
    }

    const search = await fetch(
      `${global.APIs.nexray}/search/spotify?q=${encodeURIComponent(data.result.title + ' ' + data.result.artist)}`
    )
    const s = await search.json()
    const info = s.result?.[0] || {}

    const caption = `   *Spotify Downloader*

✿ Title : ${data.result.title}
✿ Artist : ${data.result.artist}
✿ Album : ${info.album || '-'}
✿ Duration : ${info.duration || '-'}
✿ Release : ${info.release_date || '-'}
✿ Popularity : ${info.popularity ?? '-'}`

    if (info.thumbnail) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: info.thumbnail },
          caption
        },
        { quoted: m }
      )
    } else {
      await m.reply(caption)
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: data.result.url },
        mimetype: 'audio/mpeg',
        fileName: `${data.result.title}.mp3`
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

handler.help = ['spotify <judul/url>']
handler.tags = ['downloader']
handler.command = /^(spotify|spotifydl|spotifymp3)$/i
handler.register = true
handler.limit = true

export default handler