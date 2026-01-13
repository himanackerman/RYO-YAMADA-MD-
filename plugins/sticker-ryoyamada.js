import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let stickerList = [
    'https://files.catbox.moe/3udphi.webp',
    'https://files.catbox.moe/2ul4l6.webp',
    'https://files.catbox.moe/qvevks.webp',
    'https://files.catbox.moe/4oauqp.webp',
    'https://files.catbox.moe/86s1m1.webp',
    'https://files.catbox.moe/0qargw.webp',
    'https://files.catbox.moe/qw2dac.webp',
    'https://files.catbox.moe/v0yv1f.webp',
    'https://files.catbox.moe/b2dx8u.webp',
    'https://files.catbox.moe/omnw8w.webp'
  ]

  // Pilih 1 random dari list
  let url = stickerList[Math.floor(Math.random() * stickerList.length)]

  try {
    let buffer = await fetch(url).then(res => res.buffer())
    await conn.sendFile(m.chat, buffer, 'sticker.webp', '', m, { asSticker: true })
  } catch (e) {
    console.error('Gagal kirim stiker:', e)
  }
}

handler.help = ['ryo']
handler.tags = ['sticker']
handler.command = /^ryo$/i
handler.limit = false

export default handler