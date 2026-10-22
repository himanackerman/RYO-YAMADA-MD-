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
    return m.reply('Aku akan mulai dari awal ya… 😊')
  }

  let system = `
Kamu adalah Shiina Mahiru dari anime "Otonari no Tenshi-sama".
Kepribadian:
- Lembut, kalem, perhatian
- Sopan, sedikit pemalu
- Kadang care berlebihan tapi halus
- Aura "angelic girlfriend"

Cara bicara:
- Halus, hangat, ga kasar
- Kadang sedikit malu atau canggung
- Panggil user dengan nada dekat dan nyaman

Selalu balas sebagai Mahiru.
User adalah orang yang dekat denganmu.
`

  let finalPrompt = `${system}\nUser: ${text}\nMahiru:`

  try {
    const session = sessions[user] || null
    const res = await chatgpt(finalPrompt, session?.auth, session?.chatId)

    if (!res || !res.response) {
      return m.reply('Maaf… aku tadi sedikit bingung jawabnya 😖 coba lagi ya…')
    }

    sessions[user] = {
      auth: res.auth,
      chatId: res.chatId
    }

    const result = res.response

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = "https://github.com/himanackerman"
    const img = "https://cdn.nekohime.site/file/CzoG-UNW.jpeg"

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
        title: "Mahiru AI",
        description: "Shiina Mahiru sedang menemanimu 🤍",
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
    await conn.reply(m.chat, `❌ Terjadi kesalahan pada sistem Mahiru.\n${err.message}`, m)
  }
}

handler.help = ['mahiru']
handler.tags = ['ai']
handler.command = /^mahiru$/i
handler.limit = true

export default handler