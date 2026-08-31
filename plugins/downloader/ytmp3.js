import fs from 'node:fs'
import yts from 'yt-search'
import { downloadYoutubeAudio, cleanupDownload } from '../../lib/scrape/youtube.js'

let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh:
.ytmp3 https://youtube.com/watch?v=337-Aroj1Ew
.ytmp3 dj 30 detik`

  await m.react('🕒')

  let result

  try {
    let url = text

    if (!/^https?:\/\//i.test(text)) {
      const search = await yts(text)
      const video = search.videos[0]
      if (!video) throw 'Video tidak ditemukan.'
      url = video.url
    }

    try {
      result = await downloadYoutubeAudio(url)

      const buffer = fs.readFileSync(result.path)
      const size = fs.statSync(result.path).size

      if (size > 50 * 1024 * 1024) {
        await conn.sendMessage(m.chat, {
          document: buffer,
          mimetype: 'audio/mpeg',
          fileName: `${result.title}.mp3`
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          audio: buffer,
          mimetype: 'audio/mpeg',
          fileName: `${result.title}.mp3`,
          ptt: false
        }, { quoted: m })
      }

      await cleanupDownload(result.outputDir)
      await m.react('✅')
      return
    } catch (e) {
      console.log('[YTMP3] Local downloader gagal:', e.message)
      if (result?.outputDir) await cleanupDownload(result.outputDir).catch(() => {})
    }

    let data

    try {
      const res = await fetch(`${global.APIs.nexray}/downloader/savetube?url=${encodeURIComponent(url)}&quality=mp3`)
      const json = await res.json()

      if (!json.status) throw new Error()

      data = json.result
    } catch {
      const res = await fetch(`${global.APIs.nexray}/downloader/v1/ytmp3?url=${encodeURIComponent(url)}`)
      const json = await res.json()

      if (!json.status) throw new Error(json.message || 'Gagal mengambil audio.')

      data = json.result
    }

    const res = await fetch(data.url)
    const buffer = Buffer.from(await res.arrayBuffer())

    if (buffer.length > 50 * 1024 * 1024) {
      await conn.sendMessage(m.chat, {
        document: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${data.title || 'audio'}.mp3`
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${data.title || 'audio'}.mp3`,
        ptt: false
      }, { quoted: m })
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw e.message || 'Terjadi kesalahan.'
  }
}

handler.help = ['ytmp3']
handler.tags = ['downloader']
handler.command = /^ytmp3$/i
handler.limit = true

export default handler