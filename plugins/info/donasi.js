let handler = async (m, { conn }) => {
  const { prepareWAMessageMedia } = await import('baileys')

  const urlB = "https://github.com/himanackerman"
  const img = "https://files.catbox.moe/0pdxsl.jpg"

  const { imageMessage: image } = await prepareWAMessageMedia({
    image: { url: img }
  }, {
    upload: conn.waUploadToServer,
    mediaTypeOverride: 'thumbnail-link'
  })

  image.width = 1280
  image.height = 720

  const thumb = Buffer.from(await (await fetch(img)).arrayBuffer())

  const invisible = '\u200B'.repeat(400)

  let text = `
*SUPPORT BOT RYO YAMADA MD* 🤍

Jika bot ini bermanfaat untukmu,
kamu bisa memberikan dukungan lewat donasi ✨

https://saweria.co/Hilmanytta
`

  await conn.sendMessage(m.chat, {
    text: `${urlB}${invisible}\n\n${text}`,
    linkPreview: {
      'matched-text': urlB,
      title: "Dukung Ryo Yamada MD",
      description: "Saweria - Hilmanytta",
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
handler.help = ['donasi']
handler.tags = ['info']
handler.command = /^donasi$/i

export default handler