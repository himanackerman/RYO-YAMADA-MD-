import { prepareWAMessageMedia } from 'baileys'
import {
  scrapeSoundCloud,
  searchSoundCloud,
  downloadSoundCloudBuffer
} from '../../lib/scrape/soundcloud.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `Masukkan link SoundCloud atau judul lagu!\n\n*Contoh:*\n• ${usedPrefix + command} https://soundcloud.com/chaseatlantic/swim-2\n• ${usedPrefix + command} swim chase atlantic`
    )
  }

  await m.react('✨')

  try {
    let targetUrl = text.trim()

    const isUrl = /https?:\/\/(soundcloud\.com|on\.soundcloud\.com)\//i.test(text)
    if (!isUrl) {
      const searchResults = await searchSoundCloud(text, 1)
      if (!searchResults.length) {
        await m.react('❌')
        return m.reply(`❌ Lagu *"${text}"* tidak ditemukan di SoundCloud.`)
      }
      targetUrl = searchResults[0].url
    }

    const track = await scrapeSoundCloud(targetUrl)

    const caption = `
✿ *${track.title}*

✿ *Artist:* ${track.artist}
✿ *Duration:* ${track.duration}
✿ *Genre:* ${track.genre}

_Sedang mengunduh dan merapikan audio..._
`.trim()

    let thumbBuffer = null
    let image = null

    if (track.thumbnail) {
      try {
        const thumbRes = await fetch(track.thumbnail)
        thumbBuffer = Buffer.from(await thumbRes.arrayBuffer())

        const prepared = await prepareWAMessageMedia(
          { image: thumbBuffer },
          {
            upload: conn.waUploadToServer,
            mediaTypeOverride: 'thumbnail-link'
          }
        )
        image = prepared.imageMessage
        image.width = 500
        image.height = 500
      } catch (_) {}
    }

    const invisible = '\u200B'.repeat(400)

    await conn.sendMessage(
      m.chat,
      {
        text: `${targetUrl}${invisible}\n\n${caption}`,
        linkPreview: {
          'matched-text': targetUrl,
          title: track.title,
          description: `${track.artist} • ${track.duration}`,
          previewType: 0,
          jpegThumbnail: thumbBuffer,
          highQualityThumbnail: image,
          linkPreviewMetadata: {
            socialMediaPostType: 4,
            linkMediaDuration: 0
          }
        }
      },
      { quoted: m }
    )

    const { buffer: audioBuffer, ext } =
      await downloadSoundCloudBuffer(track.streamUrl, track.protocol)

    const fileName = `${track.artist} - ${track.title}.${ext}`
    const limitSize = 50 * 1024 * 1024

    if (audioBuffer.length > limitSize) {
      await conn.sendMessage(
        m.chat,
        {
          document: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName,
          ptt: false
        },
        { quoted: m }
      )
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ Gagal: ${e.message}`)
  }
}

handler.help = ['soundcloud <url/judul>']
handler.tags = ['downloader']
handler.command = /^(soundcloud|scdl)$/i
handler.limit = true

export default handler