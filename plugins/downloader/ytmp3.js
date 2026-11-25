import yts from 'yt-search'
import { saveTube } from '../../lib/scrape/youtube.js'

let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh:
.ytmp3 https://youtube.com/watch?v=337-Aroj1Ew
.ytmp3 dj 30 detik`

  await m.react('🕒')

  try {
    let url = text.trim()

    if (!/^https?:\/\//i.test(url)) {
      const search = await yts(url)
      const video = search.videos[0]
      if (!video) throw 'Video tidak ditemukan.'
      url = video.url
    }

    const data = await saveTube(url, 'audio', '128')

    if (!data?.downloadUrl) {
      throw new Error('Gagal mendapatkan file audio.')
    }

    await conn.sendMessage(m.chat, {
      audio: { url: data.downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${data.title || 'audio'}.mp3`,
      ptt: false
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw e.message || 'Terjadi kesalahan saat mengunduh audio.'
  }
}

handler.help = ['ytmp3']
handler.tags = ['downloader']
handler.command = /^ytmp3$/i
handler.limit = true

export default handler
