import { sticker } from '../../lib/sticker.js'

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Masukkan teks untuk stiker.')

  try {
    const url = `https://api.nexray.web.id/maker/bratanime?text=${encodeURIComponent(text)}`
    let stiker = await sticker(false, url, 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ', 'ʙy ʜɪʟᴍᴀɴ')

    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('Terjadi kesalahan saat membuat stiker.')
  }
}

handler.command = ['animebrat']
handler.help = ['animebrat']
handler.tags = ['sticker']

export default handler