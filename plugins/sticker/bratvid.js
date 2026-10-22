import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, args }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) return m.reply(`✨ Masukin teks dong!\nContoh: .bratvid halo hilman`)

  try {
    const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text)}`
    let stiker = await sticker(false, url, 'Sticker', 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ')

    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
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