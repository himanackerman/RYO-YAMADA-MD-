/* 
• Plugins Brat Video
• Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• Api: https://api.nekorinn.my.id
*/

import fetch from 'node-fetch'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: 'Contoh: .bratvid aku gppa kok:v'
    }, { quoted: m })
  }

  await conn.sendMessage(m.chat, {
    react: {
      text: '🎀',
      key: m.key
    }
  })

  try {
    const url = `https://api.nekorinn.my.id/maker/bratvid?text=${encodeURIComponent(text)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Gagal mengambil video dari API.')

    const videoBuffer = Buffer.from(await res.arrayBuffer())

    const stiker = new Sticker(videoBuffer, {
      pack: 'Ryo Yamada MD',
      author: 'ytta',
      type: StickerTypes.FULL,
      quality: 70,
      animated: true
    })

    const stickerBuffer = await stiker.toBuffer()

    await conn.sendMessage(m.chat, {
      sticker: stickerBuffer
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: 'Gagal membuat stiker bratvid. Coba lagi nanti.'
    }, { quoted: m })
  }
}

handler.help = ['bratvid2 <text>']
handler.tags = ['sticker']
handler.command = /^bratvid2$/i
handler.limit = true

export default handler