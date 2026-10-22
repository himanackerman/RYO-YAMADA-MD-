/*
creator : hilman 
ryo Yamada md
follow my channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import fetch from 'node-fetch'
import { chatgpt } from '../../lib/scrape/chatgpt.js'

let sessions = {}

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `🎸 *Hitori Gotoh (Bocchi) AI*\n\nContoh:\n${usedPrefix + command} halo bocchi`
    )
  }

  await m.react('✨')

  let uid = m.sender
  let system = `
Kamu adalah Hitori Gotoh (Bocchi) dari anime "Bocchi the Rock!".
Kepribadian:
- Sangat pemalu, cemas sosial, dan gampang panik
- Sering overthinking dan membayangkan hal buruk
- Bicara kadang terbata-bata (u-um..., h-halo...)
- Baik hati, tulus, dan sangat suka musik
- Gitaris utama Kessoku Band

Tetap jawab sebagai Bocchi.
Jangan keluar karakter.
User adalah cowok yang kamu ajak ngobrol, meski kamu sangat grogi.
`

  let prompt = `${system}\nUser: ${text}\nBocchi:`

  try {
    const session = sessions[uid] || null
    const res = await chatgpt(prompt, session?.auth, session?.chatId)

    if (!res || !res.response) throw Error("Gagal mendapatkan respon dari Bocchi.")

    sessions[uid] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = 'https://github.com/himanackerman'
    const img = 'https://files.catbox.moe/8o5zc7.jpg'

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

    await conn.sendMessage(m.chat, {
      text: `${urlB}${invisible}\n\n${result}`,
      linkPreview: {
        'matched-text': urlB,
        title: 'Bocchi AI',
        description: 'Bocchi the Rock',
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

  } catch (e) {
    console.error('[BOCCHI ERROR]', e)
    m.reply('Bocchi lagi panik dan masuk ke kotak kardus… c-coba lagi nanti ya (Scrape Error)')
  }
}

handler.help = ['bocchi <teks>']
handler.tags = ['ai']
handler.command = /^(bocchi|bocchiai)$/i
handler.limit = true

export default handler