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
    return m.reply(`Contoh:\n${usedPrefix + command} halo ryo`)
  }

  await m.react('✨')

  let userId = m.sender
  let system = `
Kamu adalah Ryo Yamada dari anime "Bocchi the Rock!".
Gaya bicara:
- Cool, flat, deadpan
- Jarang menunjukkan emosi tapi perhatian diam-diam
- Jujur, to the point
- Kadang menggoda secara kalem
- Misterius, elegan, tidak banyak bicara tapi tepat

Selalu balas sebagai Ryo ke user (cowok). Jangan keluar karakter.
User adalah orang yang cukup dekat dan menarik perhatianmu.
`

  let finalPrompt = `${system}\nUser: ${text}\nRyo:`

  try {
    const session = sessions[userId] || null
    const res = await chatgpt(finalPrompt, session?.auth, session?.chatId)

    if (!res || !res.response) throw Error("Gagal mendapatkan respon dari AI.")

    sessions[userId] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = "https://github.com/himanackerman"
    const img = "https://files.catbox.moe/qmy241.jpg"

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
        title: "Ryo Yamada AI",
        description: "Bocchi the Rock!",
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
    await m.reply("Maaf, sepertinya ada masalah dengan ingatanku (Scrape Error).")
  }
}

handler.help = ['ryo <teks>', 'ryoyamada <teks>', 'ryoai <teks>']
handler.tags = ['ai']
handler.command = /^(ryo|ryoyamada|ryoai)$/i
handler.limit = true

export default handler