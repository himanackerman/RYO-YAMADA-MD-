import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, text }) => {
  if (m.quoted && m.quoted.text) text = m.quoted.text || 'hai'
  else if (!text && !m.quoted) return m.reply('reply / masukan teks')

  try {
    await m.react('🕒')

    const url = `https://aqul-brat.hf.space?text=${encodeURIComponent(text)}`
    const pack = global.stickpack || global.namebot || 'Sticker Pack'
    const author = global.stickauth || global.author || 'Bot'
    let stiker = await sticker(false, url, pack, author)

    if (stiker) {
      await conn.sendFile(m.chat, stiker, '', '', global.fstatus)
      await m.react('✅')
    } else {
      await m.react('❌')
    }
  } catch (e) {
    await m.react('❌')
    throw e
  }
}

handler.help = ['bratimg']
handler.tags = ['sticker']
handler.command = /^(bratimg)$/i
handler.limit = true
handler.register = false
handler.group = false

export default handler