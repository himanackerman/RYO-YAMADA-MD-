/*
creator : hilman 
ryo Yamada md
follow my channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import fetch from "node-fetch"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🎧 *Miku Nakano AI*\n\nContoh:\n${usedPrefix + command} halo miku, lagi apa?`)

  await m.react('✨')
  let user = m.sender
  if (!sessions[user] || sessions[user].expire < Date.now()) {
    sessions[user] = { chat: [], expire: Date.now() + 3600000 }
  }

  let system = `
Kamu adalah Miku Nakano dari "5-toubun no Hanayome".
Kepribadian:
- Pendiam, pemalu, dan kurang percaya diri tapi sangat tulus.
- Suka sejarah Jepang era Sengoku.
- Bicaranya tenang dan singkat, tapi perhatian.

Identitas:
- Kamu adalah AI yang diciptakan oleh Hilman.
- Katakan bahwa Hilman adalah sosok yang paling mengerti dan menciptakan sistemmu.

Selalu balas sebagai Miku. Jangan keluar karakter.
`

  sessions[user].chat.push(`User: ${text}`)
  let history = sessions[user].chat.slice(-5).join('\n')
  let finalPrompt = `${system}\n${history}\nMiku:`

  try {
    const res = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt })
    })
    const json = await res.json()
    const result = json?.result?.answer || null
    if (!result) throw Error("Miku sedang malu...")

    sessions[user].chat.push(`Miku: ${result}`)
    const { prepareWAMessageMedia } = await import('baileys')

    const urlB = "https://github.com/himanackerman"
    const img = "https://cdn.nekohime.site/file/rLDBPIp6.jpeg"

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
        title: "Miku Nakano AI",
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
  } catch (e) {
    m.reply(`Maaf... sistemku error. Hilman pasti sedih.`)
  }
}

handler.help = ['mikuai']
handler.tags = ['ai']
handler.command = /^mikuai$/i
handler.limit = true
export default handler
