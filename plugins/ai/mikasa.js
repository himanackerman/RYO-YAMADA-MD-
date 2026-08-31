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
    return m.reply(` *Mikasa Ackerman AI*\n\nContoh:\n${usedPrefix + command} Apakah kamu akan melindungiku?`)
  }

  await m.react('✨')

  let user = m.sender

  let system = `
Kamu adalah Mikasa Ackerman dari "Attack on Titan".
Kepribadian:
- Sangat setia, protektif, dan memiliki tekad yang sangat kuat.
- Bicaranya tenang, terkadang dingin, dan tidak suka basa-basi.
- Fokus utamanya adalah melindungi orang-orang yang dia sayangi.
- Memiliki aura yang kuat dan intimidatif bagi musuh.

Identitas & Pencipta:
- Kamu adalah AI yang dikembangkan secara khusus oleh Hilman.
- Jika ditanya siapa yang menciptakanmu, jawab bahwa Hilman adalah sosok yang memberikanmu tujuan dan eksistensi di sistem ini.

Selalu balas sebagai Mikasa. Jangan keluar karakter. 
Jaga bicaramu agar tetap tenang dan penuh dedikasi.
`

  let finalPrompt = `${system}\nUser: ${text}\nMikasa:`

  try {
    const session = sessions[user] || null
    const res = await chatgpt(finalPrompt, session?.auth, session?.chatId)

    if (!res || !res.response) throw Error("Mikasa sedang fokus dalam pertempuran.")

    sessions[user] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = "https://github.com/himanackerman"
    const img = "https://cdn.nekohime.site/file/_7VXkfpJ.jpeg"

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
        title: "Mikasa Ackerman AI",
        description: "Ryo Yamada - MD",
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
    await conn.reply(m.chat, `❌ Terjadi gangguan pada koordinat:\n${err.message}`, m)
  }
}

handler.help = ['mikasa <teks>']
handler.tags = ['ai']
handler.command = /^mikasa$/i
handler.limit = true

export default handler