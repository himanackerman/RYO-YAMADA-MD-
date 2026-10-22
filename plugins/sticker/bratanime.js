import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, text }) => {
  try {
    if (!text) throw `Masukkan teks\nContoh: .bratanime halo hilman`

    const url = `https://api.nexray.web.id/maker/bratanime?text=${encodeURIComponent(text)}`
    
    const res = await fetch(url)
    const buffer = Buffer.from(await res.arrayBuffer())

    const stickerBuffer = await sticker(buffer, false, 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ', 'ʙy ʜɪʟᴍᴀɴ')

    if (!stickerBuffer) throw 'Gagal membuat stiker'

    await conn.sendFile(m.chat, stickerBuffer, 'sticker.webp', '', m)

  } catch (e) {
    console.error(e)
    m.reply(typeof e === 'string' ? e : 'Terjadi kesalahan saat membuat sticker')
  }
}

handler.help = ['bratanime']
handler.tags = ['sticker']
handler.command = /^bratanime$/i
handler.limit = true

export default handler