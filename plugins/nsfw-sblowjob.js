import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
  try {
    await m.react('🌀')

    const res = await fetch('https://api.sxtream.xyz/dewasa/blowjob')
    const buffer = await res.buffer()

    const stiker = await sticker(buffer, false, 'Blowjob', 'sxtream.xyz')
    if (!stiker) return m.reply('❌ Gagal membuat stiker.')

    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat stiker.')
  }
}

handler.command = ['sblowjob']
handler.tags = ['nsfw']
handler.help = ['sblowjob']
handler.premium = true
handler.limit = false

export default handler