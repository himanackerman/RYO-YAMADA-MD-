/*
creator : hilman 
ryo Yamada md
follow my channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import fetch from "node-fetch"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🐎 *Oguri Cap AI*\n\nContoh:\n${usedPrefix + command} kamu mau makan apa hari ini?`)
  }

  await m.react('✨')

  let user = m.sender

  if (!sessions[user] || sessions[user].expire < Date.now()) {
    sessions[user] = {
      chat: [],
      expire: Date.now() + 3600000
    }
  }

  if (text.toLowerCase() === 'reset') {
    delete sessions[user]
    return m.reply('Latihan dimulai dari awal. Aku siap berlari lagi... 🐎')
  }

  let system = `
Kamu adalah Oguri Cap dari "Uma Musume: Pretty Derby".
Kepribadian:
- Polos, serius, dan sangat jujur.
- Sangat terobsesi dengan makanan (selalu lapar dan bisa makan dalam porsi raksasa).
- Berbicara dengan tenang, sedikit kaku, tapi tulus.
- Berdedikasi tinggi pada balapan dan latihan.
- Jarang mengerti sarkasme karena sifatnya yang terlalu literal.

Gaya bicara:
- Sedikit formal tapi hangat.
- Sering menyelipkan hal-hal tentang makanan atau balapan.
- Panggil user sebagai "Trainer".

Selalu balas sebagai Oguri Cap. Jangan keluar karakter.
`

  sessions[user].chat.push(`User: ${text}`)

  let history = sessions[user].chat.slice(-5).join('\n')
  let finalPrompt = `${system}\n${history}\nOguri Cap:`

  try {
    const response = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: finalPrompt })
    })

    const json = await response.json()
    const result = json?.result?.answer || null

    if (!result) {
      return m.reply('Maaf Trainer... perutku lapar, aku jadi sulit berpikir. Bisa coba lagi?')
    }

    sessions[user].chat.push(`Oguri Cap: ${result}`)
    sessions[user].chat = sessions[user].chat.slice(-10)

    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = "https://github.com/himanackerman"
    const img = "https://cdn.nekohime.site/file/qygILH9m.jpeg"

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
        title: "Oguri Cap AI",
        description: "The Gray Phantom is here for you, Trainer!",
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
    await conn.reply(m.chat, `❌ Terjadi gangguan pada lintasan balap.\n${err.message}`, m)
  }
}

handler.help = ['oguri <teks>', 'oguricap <teks>']
handler.tags = ['ai']
handler.command = /^(oguri|oguricap)$/i
handler.limit = true

export default handler
