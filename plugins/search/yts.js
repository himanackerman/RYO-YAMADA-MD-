/*
creator : hilman 
ryo Yamada md
follow my channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import yts from 'yt-search'

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) throw `Masukkan judul!

Contoh:
${usedPrefix + command} dj 30 detik`

  let search = await yts(text)
  let videos = search.videos.slice(0, 10)

  if (!videos.length) throw 'Video tidak ditemukan.'

  let caption = `✨ *YouTube Search*\n`
  caption += `Query: ${text}\n\n`

  for (let i = 0; i < videos.length; i++) {
    let v = videos[i]
    caption += `*${i + 1}. ${v.title}*\n`
    caption += `⏱ ${v.timestamp} | 🍓 ${v.views.toLocaleString()}\n`
    caption += `📎 ${v.url}\n\n`
  }

  const { prepareWAMessageMedia } = await import('baileys')

  const urlB = videos[0].url
  const img = videos[0].thumbnail

  const { imageMessage: image } = await prepareWAMessageMedia({
    image: { url: img }
  }, {
    upload: conn.waUploadToServer,
    mediaTypeOverride: 'thumbnail-link'
  })

  image.width = 1280
  image.height = 720

  const thumb = Buffer.from(await (await fetch(img)).arrayBuffer())

  await conn.sendMessage(m.chat, {
    text: caption,
    linkPreview: {
      'matched-text': urlB,
      title: "YouTube Search",
      description: text,
      previewType: 0,
      jpegThumbnail: thumb,
      highQualityThumbnail: image,
      linkPreviewMetadata: {
        linkMediaDuration: 0,
        socialMediaPostType: 4
      }
    },
    favicon: { url: img }
  }, { quoted: m })
}

handler.help = ['yts', 'youtubesearch']
handler.tags = ['search']
handler.command = /^(yts|youtubesearch)$/i
handler.limit = true

export default handler