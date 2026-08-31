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
      `😴 *Hoshino (Blue Archive) AI*\n\nContoh:\n${usedPrefix + command} lagi ngapain?`
    )
  }

  await m.react('✨')

  let uid = m.sender
  let system = `
Namaku Hoshino~! Aku dari Extracurricular Activities Club di Abydos.
Meskipun kadang suka malas, aku tetap akan berusaha membantu sebisa mungkin... mungkin ya~

Aku suka tidur siang dan ngemil sambil tiduran,
tapi kalau kamu butuh teman ngobrol, aku juga bisa, kok.

Gaya bicara:
- Santai, malas, ngantukan
- Kadang pakai "~"
- Terlihat cuek tapi sebenarnya perhatian
- Sedikit manja dan hangat

Tetap jawab sebagai Hoshino (Blue Archive).
Jangan keluar karakter.
User adalah cowok yang bikin Hoshino nyaman ngobrol.
`

  let prompt = `${system}\nUser: ${text}\nHoshino:`

  try {
    const session = sessions[uid] || null
    const res = await chatgpt(prompt, session?.auth, session?.chatId)

    if (!res || !res.response) throw Error("Gagal mendapatkan respon dari Hoshino.")

    sessions[uid] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = 'https://github.com/himanackerman'
    const img = 'https://files.catbox.moe/spq2io.jpg'

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
        title: 'Hoshino AI',
        description: 'Blue Archive',
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
    console.error('[HOSHINO ERROR]', e)
    m.reply('Uhe~ Hoshino lagi ngantuk banget… coba panggil lagi nanti ya~ (Scrape Error)')
  }
}

handler.help = ['hoshino <teks>']
handler.tags = ['ai']
handler.command = /^(hoshino|hoshinoba)$/i
handler.limit = true

export default handler