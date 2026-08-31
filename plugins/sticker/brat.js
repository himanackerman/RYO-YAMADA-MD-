import { bratGen } from 'brat-canvas'
import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, text }) => {
  if (m.quoted && m.quoted.text) text = m.quoted.text || 'hai'
  else if (!text && !m.quoted) return m.reply('reply / masukan teks')

  try {
    await m.react('🕜')
    const { buffer } = await bratGen(text)
    const stiker = await sticker(Buffer.from(buffer), false, global.stickpack || global.namebot || 'Sticker Pack', global.stickauth || global.author || 'Bot')

    if (stiker) {
      await conn.sendFile(m.chat, stiker, '', '', m)
      await m.react('✅')
    } else {
      await m.react('❌')
    }
  } catch (e) {
    await m.react('❌')
    throw e
  }
}

handler.help = ['brat <text>']
handler.tags = ['sticker']
handler.command = /^(brat)$/i
handler.limit = true
handler.register = false
handler.group = false

export default handler