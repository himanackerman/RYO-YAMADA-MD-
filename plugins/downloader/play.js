import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} judul lagu`)
  }

  await m.react('🕒')

  try {
    const search = await yts(text)
    const videos = search.videos

    if (!videos.length) {
      await m.react('❌')
      return m.reply('Tidak ditemukan.')
    }

    const video = videos[0]

    const caption = `Play Music\n\n✿ Title : ${video.title}\n✿ Duration : ${video.timestamp || '-'}\n✿ Views : ${formatNumber(video.views)}\n✿ Channel : ${video.author.name}${video.author.verified ? ' ✓' : ''}\n✿ Upload : ${video.ago || '-'}\n\nSilakan pilih format download di bawah.`

    await new ButtonV2(conn)
      .setBody(caption)
      .setFooter('Ryo Yamada MD')
      .setThumbnail(video.thumbnail)
      .addButton('🎵 Audio MP3', `.ytmp3 ${video.url}`)
      .addButton('🎥 Video MP4', `.ytmp4 ${video.url}`)
      .send(m.chat, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('Terjadi kesalahan.')
  }
}

handler.help = ['play']
handler.tags = ['downloader']
handler.command = /^(play)$/i

export default handler

function formatNumber(num = 0) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toString()
}