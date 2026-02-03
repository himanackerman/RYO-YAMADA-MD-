/* 
• Fitur : Bratvid
• API : https://brat.siputzx.my.id
*/
import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, args }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) return m.reply(`✨ Masukin teks dong!\nContoh: .bratvid halo hilman`)

  try {
    const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text)}`
    const buffer = (await axios.get(url, { responseType: 'arraybuffer' })).data

    const stickerBuffer = await createSticker(buffer, {
      type: StickerTypes.FULL,
      pack: 'Sticker',
      author: 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ',
      categories: ['✨'],
      id: '.',
      quality: 70,
      background: null
    })

    await conn.sendFile(m.chat, stickerBuffer, 'sticker.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('yahh error')
  }
}

handler.help = ['bratvid <teks>']
handler.tags = ['sticker']
handler.command = /^bratvid$/i
handler.limit = true

export default handler