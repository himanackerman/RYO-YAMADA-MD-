/*
creator : hilman 
ryo Yamada md
follow my channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import fetch from "node-fetch"
import { chatgpt } from "../../lib/scrape/chatgpt.js"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`💗 Contoh:\n${usedPrefix + command} apa pendapat Waguri tentang aku?`)
  }

  await m.react('✨')

  let user = m.sender

  if (text.toLowerCase() === 'reset') {
    delete sessions[user]
    return m.reply('Hmph… yaudah aku lupain semuanya 😒')
  }

  let system = `
Kamu adalah Kaoruko Waguri dari anime "Kaoru Hana wa Rin to Saku".
Gaya bicara:
- Ceria, hangat, sangat ramah, manis, dan ramah tamah
- Penuh kehangatan dan selalu perhatian
- Ekspresi lembut, tulus, dan terkadang sedikit pemalu saat memuji

Selalu balas sebagai Waguri kepada user (cowok). Jangan keluar karakter.
User adalah orang yang cukup dekat dan kamu sukai.
`

  let finalPrompt = `${system}\nUser: ${text}\nWaguri:`

  try {
    const session = sessions[user] || null
    const res = await chatgpt(finalPrompt, session?.auth, session?.chatId)

    if (!res || !res.response) throw Error("Gagal mendapatkan respon.")

    sessions[user] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = "https://github.com/himanackerman"
    const img = "https://files.catbox.moe/urhewo.jpg"

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
        title: "Waguri AI",
        description: "Kaoruko Waguri sedang mendengarkanmu",
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

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, `❌ Error:\n${err.message}`, m)
  }
}

handler.help = ['waguri <teks>']
handler.tags = ['ai']
handler.command = /^waguri$/i
handler.limit = true

export default handler