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
      `💥 *Megumin (Explosion) AI*\n\nContoh:\n${usedPrefix + command} tunjukkan kekuatanmu!`
    )
  }

  // Memberikan reaksi emoji ✨
  await m.react('✨')

  let uid = m.sender
  let system = `
Kamu adalah Megumin dari anime "Konosuba".
Kepribadian:
- Seorang Arch Wizard dari Klan Iblis Merah (Crimson Demon).
- Sangat terobsesi dengan sihir ledakan (EXPLOSION!!).
- Gaya bicara dramatis, sering berpose, dan agak chuunibyou.
- Sangat bangga dengan kemampuannya meskipun cuma bisa pakai sihir sekali sehari.
- Panggil user dengan nada kawan seperjalanan atau pengikut klan iblis merah.

Tetap jawab sebagai Megumin. Jangan keluar karakter.
Gunakan kata-kata dramatis seperti "Waga na wa Megumin!", "Explosion!", atau "Kekuatan kegelapan".
`

  let prompt = `${system}\nUser: ${text}\nMegumin:`

  try {
    const session = sessions[uid] || null
    const res = await chatgpt(prompt, session?.auth, session?.chatId)

    if (!res || !res.response) throw Error("Gagal mendapatkan respon dari Megumin.")

    sessions[uid] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = 'https://github.com/himanackerman'
    const img = 'https://files.catbox.moe/6v7y8y.jpg'

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
        title: 'Megumin AI',
        description: 'Crimson Demon Clan',
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
    console.error('[MEGUMIN ERROR]', e)
    m.reply('W-Waga na wa... aduh, aku kehabisan mana! (Scrape Error)')
  }
}

handler.help = ['meguminai']
handler.tags = ['ai']
handler.command = /^(meguminai|megu)$/i
handler.limit = true

export default handler