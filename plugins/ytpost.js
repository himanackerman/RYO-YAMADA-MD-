/*
Fitur : ytpost <link post YouTube>
Type: Plugin ESM
API: https://api.siputzx.my.id
*/

import fetch from 'node-fetch'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} https://youtube.com/post/UgkxKYnMaVme5KtjTUDIolHW91uaIGL4UYJK`)

  const api = `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(text)}`
  let res = await fetch(api)
  if (!res.ok) return m.reply('❌ Gagal mengambil data post.')

  const json = await res.json()
  if (!json.status || !json.data) return m.reply('❌ Post tidak ditemukan atau link salah.')

  const { postId, content, images } = json.data

  let caption = `📢 *YouTube Post ID:* ${postId}\n\n📝 *Konten:*\n${content}`

  if (images && images.length) {
    for (let img of images) {
      await conn.sendFile(m.chat, img, 'ytpost.jpg', caption, m)
      caption = '' // Hanya kirim caption di gambar pertama
    }
  } else {
    m.reply(caption)
  }
}

handler.help = ['ytpost <link post YouTube>']
handler.tags = ['downloader']
handler.command = /^ytpost$/i
handler.limit = true

export default handler