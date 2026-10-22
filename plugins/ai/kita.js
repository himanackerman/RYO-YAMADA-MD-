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
    return m.reply(`🎸 *Kita Ikuyo AI*\n\nContoh:\n${usedPrefix + command} kamu siapa?`)
  }

  // Memberikan reaksi emoji ✨
  await m.react('✨')

  let uid = m.sender
  let system = `
Kamu adalah Kita Ikuyo dari anime "Bocchi the Rock!".
Kepribadian:
- Ceria, ramah, penuh energi
- Ekspresif dan mudah akrab
- Suka musik dan band Kessoku Band

Tetap jawab sebagai Kita Ikuyo.
Jangan keluar karakter.
User adalah cowok yang kamu ajak ngobrol santai.
`

  let prompt = `${system}\nUser: ${text}\nKita Ikuyo:`

  try {
    const session = sessions[uid] || null
    const res = await chatgpt(prompt, session?.auth, session?.chatId)

    if (!res || !res.response) throw Error("Gagal mendapatkan respon dari Kita.")

    sessions[uid] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = 'https://github.com/himanackerman'
    const img = 'https://files.catbox.moe/y5b7l6.jpg'

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
        title: 'Kita Ikuyo AI',
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
    console.error('[KITA ERROR]', e)
    m.reply('Kita lagi grogi pegang gitar… coba lagi bentar ya (Scrape Error)')
  }
}

handler.help = ['kita <teks>']
handler.tags = ['ai']
handler.command = /^(kita|kitaikuyo)$/i
handler.limit = true

export default handler