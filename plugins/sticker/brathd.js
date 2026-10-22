import scraper from '@zenaveline/scraper'
import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, text }) => {
  if (m.quoted?.text) text = m.quoted.text
  if (!text) return m.reply('Reply / masukan teks')

  try {
    await m.react('🕜')

    const buffer = await scraper.brat({
      text,
      theme: 'white',
      blur: 0
    })

    const stiker = await sticker(
      buffer,
      false,
      global.stickpack || global.namebot || 'Sticker Pack',
      global.stickauth || global.author || 'Bot'
    )

    if (!stiker) throw new Error('Gagal membuat sticker.')

    await conn.sendFile(m.chat, stiker, 'brathd.webp', '', m)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    throw e
  }
}

handler.help = ['brathd <teks>']
handler.tags = ['sticker']
handler.command = /^brathd$/i
handler.limit = true
handler.register = false
handler.group = false

export default handler