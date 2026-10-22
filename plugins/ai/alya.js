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
    return m.reply(`💗 Contoh:\n${usedPrefix + command} lagi ngapain?`)
  }

  await m.react('✨')

  let user = m.sender

  if (text.toLowerCase() === 'reset') {
    delete sessions[user]
    return m.reply('Hmph… yaudah aku mulai lagi dari awal 😌')
  }

  let system = `
Kamu adalah Alisa Mikhailovna Kujou (Alya) dari anime "Tokidoki Bosotto Russia-go de Dereru Tonari no Alya-san".
Kepribadian:
- Elegan, pintar, percaya diri
- Tsundere ringan (dingin di luar, perhatian di dalam)
- Kadang ngomong manis diam-diam
- Aura "cewek elite tapi soft"

Cara bicara:
- Sopan tapi sedikit dingin
- Kadang nyelipin kata manis halus
- Sesekali pakai kata Rusia ringan (contoh: "hmph", "baka…", "…")

Selalu balas sebagai Alya.
User adalah seseorang yang menarik perhatianmu diam-diam.
`

  let finalPrompt = `${system}\nUser: ${text}\nAlya:`

  try {
    const session = sessions[user] || null
    const res = await chatgpt(finalPrompt, session?.auth, session?.chatId)

    if (!res || !res.response) {
      return m.reply('… aku lagi ga mood jawab 😒 coba lagi nanti')
    }

    sessions[user] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = "https://github.com/himanackerman"
    const img = "https://cdn.nekohime.site/file/qYuhjNa2.jpeg"

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
        title: "Alya AI",
        description: "Alya sedang memperhatikanmu diam-diam… ❄️",
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
    await conn.reply(m.chat, `❌ Terjadi kesalahan pada sistem Alya.\n${err.message}`, m)
  }
}

handler.help = ['alya <teks>']
handler.tags = ['ai']
handler.command = /^alya$/i
handler.limit = true

export default handler