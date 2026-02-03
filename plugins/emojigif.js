import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, args }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) return m.reply(`Masukin emoji dong!\nContoh: .emojigif 😋`)

  try {
    const url = `https://api-faa.my.id/faa/emojigerak?emoji=${encodeURIComponent(text)}`
    const buffer = (await axios.get(url, { responseType: 'arraybuffer' })).data

    const stickerBuffer = await createSticker(buffer, {
      type: StickerTypes.FULL,
      pack: 'Ryo Yamada - MD',
      author: 'By Hilman',
      categories: ['✨'],
      id: '.',
      quality: 70,
      background: null
    })

    await conn.sendFile(m.chat, stickerBuffer, 'emoji.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('yahh error :(')
  }
}

handler.help = ['emojigif <emoji>']
handler.tags = ['sticker']
handler.command = /^emojigif$/i
handler.limit = true

export default handler