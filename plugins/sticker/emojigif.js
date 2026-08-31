import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, args }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) return m.reply(`Masukin emoji dong!\nContoh: .emojigif 😋`)

  try {
    const url = `https://api-faa.my.id/faa/emojigerak?emoji=${encodeURIComponent(text)}`
    let stiker = await sticker(false, url, 'Ryo Yamada - MD', 'By Hilman')

    await conn.sendFile(m.chat, stiker, 'emoji.webp', '', m)
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