import { download } from '../../lib/scrape/savefrom.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const url = (text || '').trim()

  if (!url || !/^https?:\/\//i.test(url)) {
    return m.reply(
      `*Format salah!*\n\n` +
      `Ketik:\n` +
      `*${usedPrefix + command} <url video>*\n\n` +
      `*Contoh:* ${usedPrefix + command} https://www.instagram.com/p/xxxxx/`
    )
  }

  await m.react('🕒')

  try {
    const data = await download(url)

    if (!data.url || !data.url.length) {
      throw new Error('Media tidak ditemukan atau format tidak didukung.')
    }

    const title = data.meta?.title || data.id || 'Media'
    const duration = data.meta?.duration ? `${data.meta.duration} Detik` : '-'
    const hosting = data.hosting || '-'

    const caption = `*\`AIO Downloader\`*\n\n` +
      `✿ Title : ${title}\n` +
      `✿ Hosting : ${hosting}\n` +
      `✿ Duration : ${duration}`

    const chosenMedia = data.url.find(v => v.type === 'mp4' || v.ext === 'mp4' || v.url?.includes('.mp4')) ||
      data.url.find(v => v.url) ||
      data.url[0]

    const mediaUrl = chosenMedia.url
    if (!mediaUrl) throw new Error('URL download tidak ditemukan.')

    const isAudio = chosenMedia.type === 'audio' || chosenMedia.ext === 'mp3' || chosenMedia.audio

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: mediaUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false
      }, { quoted: m })
    } else {
      const isFileDoc = (chosenMedia.filesize && chosenMedia.filesize > 50 * 1024 * 1024)

      if (isFileDoc) {
        await conn.sendMessage(m.chat, {
          document: { url: mediaUrl },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: mediaUrl },
          caption
        }, { quoted: m })
      }
    }

    await m.react('✅')
  } catch (e) {
    console.error('Error AIO SaveFrom:', e)
    await m.react('❌')
    throw e?.message || String(e)
  }
}

handler.help = ['aio <url>']
handler.tags = ['downloader']
handler.command = /^aio$/i
handler.limit = true

export default handler
