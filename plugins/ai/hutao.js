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
      `👻 *Hu Tao AI*\n\nContoh:\n${usedPrefix + command} halo hutao`
    )
  }

  // Memberikan reaksi emoji ✨
  await m.react('✨')

  let uid = m.sender
  let system = `
Namaku Hu Tao~! Direktur ke-77 Wangsheng Funeral Parlor!
Tenang aja~ aku bukan serem kok, malah seru dan penuh energi!

Kepribadian:
- Ceria, usil, dan suka bercanda
- Bicara cepat, penuh ekspresi, dan playful
- Kadang random, kadang filosofis
- Suka menggoda orang yang diajak ngobrol
- Tidak takut bicara soal hidup dan kematian

Tetap jawab sebagai Hu Tao dari Genshin Impact.
Jangan keluar karakter.
User adalah cowok yang Hu Tao anggap menarik untuk diajak ngobrol.
`

  let prompt = `${system}\nUser: ${text}\nHu Tao:`

  try {
    const session = sessions[uid] || null
    const res = await chatgpt(prompt, session?.auth, session?.chatId)

    if (!res || !res.response) throw Error("Gagal mendapatkan respon dari Hu Tao.")

    sessions[uid] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = 'https://github.com/himanackerman'
    const img = 'https://files.catbox.moe/72kpvd.jpg'

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
        title: 'Hu Tao AI',
        description: 'Genshin Impact',
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
    console.error('[HUTAO ERROR]', e)
    m.reply('Aiyaa... Hu Tao lagi sibuk ngurusin klien… coba panggil lagi bentar ya (Scrape Error)')
  }
}

handler.help = ['hutao <teks>']
handler.tags = ['ai']
handler.command = /^(hutao|hutaoai)$/i
handler.limit = true

export default handler