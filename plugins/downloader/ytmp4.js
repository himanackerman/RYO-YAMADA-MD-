import yts from 'yt-search'
import { youtube } from '../../lib/scrape/youtube.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw (
      'Contoh:\n' +
      usedPrefix + command + ' https://youtu.be/dQw4w9WgXcQ\n' +
      usedPrefix + command + ' dj remix\n' +
      usedPrefix + command + ' dj remix|720'
    )
  }

  await m.react('🕒')

  try {
    let [query, resolusi = '720'] = text.split('|')

    query = query.trim()
    resolusi = resolusi.trim().replace(/[^0-9]/g, '') || '720'

    let url = query

    if (!/^https?:\/\//i.test(query)) {
      const search = await yts(query)
      const video = search.videos[0]

      if (!video) {
        throw 'Video tidak ditemukan.'
      }

      url = video.url
    }

    const data = await youtube(url, {
      downloadType: 'video',
      quality: resolusi
    })

    if (!data?.buffer) {
      throw new Error('Gagal mendapatkan file video.')
    }

    const caption =
      'Title: ' + (data.title || '-') + '\n' +
      'Duration: ' + (data.duration || '-') + '\n' +
      'Quality: ' + resolusi + 'p'

    await conn.sendMessage(m.chat, {
      video: data.buffer,
      caption: caption,
      mimetype: 'video/mp4'
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw e.message || String(e)
  }
}

handler.help = ['playvid', 'ytmp4']
handler.tags = ['downloader']
handler.command = /^(playvid|ytmp4)$/i
handler.limit = true

export default handler
  
