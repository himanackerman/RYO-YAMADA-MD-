import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} judul lagu`)
  }

  try {
    const search = await yts(text)
    const videos = search.videos

    if (!videos.length) {
      return m.reply('Tidak ditemukan.')
    }

    const video = videos[0]

    const caption = `Play Music

✿ Title : ${video.title}
✿ Duration : ${video.timestamp || '-'}
✿ Views : ${formatNumber(video.views)}
✿ Channel : ${video.author.name}${video.author.verified ? ' ✓' : ''}
✿ Upload : ${video.ago || '-'}

Silakan pilih format download di bawah.`

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption,
      footer: 'Ryo Yamada MD',
      optionText: 'Pilih',
      optionTitle: 'Download',
      nativeFlow: [
        {
          text: 'Pilih Format',
          sections: [
            {
              title: 'Downloader',
              rows: [
                {
                  title: 'Audio MP3',
                  description: 'Download sebagai MP3',
                  id: `.ytmp3 ${video.url}`
                },
                {
                  title: 'Audio MP3 V2',
                  description: 'Download sebagai MP3 V2',
                  id: `.ytmp3v2 ${video.url}`
                },
                {
                  title: 'Video MP4',
                  description: 'Download sebagai MP4',
                  id: `.ytmp4 ${video.url}`
                },
                {
                  title: 'Video MP4 V2',
                  description: 'Download sebagai MP4 V2',
                  id: `.ytmp4v2 ${video.url}`
                }
              ]
            }
          ]
        }
      ]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
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