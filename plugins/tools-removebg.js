// Remove Background v2
// API : https://anabot.my.id
// Author : Hilman

import fetch from 'node-fetch'
import FormData from 'form-data'

async function uploadImageToCatbox(buffer) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, 'file.jpg')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })

  const url = await res.text()
  if (!url.startsWith('http')) throw new Error('❌ Gagal upload ke Catbox')
  return url.trim()
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    let url
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (/^https?:\/\//i.test(text)) {
      url = text
    } else if (mime && mime.startsWith('image/')) {
      m.reply('✨ Lagi hapus background, tunggu bentar ya…')
      let img = await q.download?.()
      if (!img) throw '❌ Gagal download gambar.'
      url = await uploadImageToCatbox(img)
    } else {
      return m.reply(`⚠️ Reply/kirim foto atau kasih link gambar dengan caption *${usedPrefix + command}*`)
    }

    const apiUrl = `https://anabot.my.id/api/ai/removebg?imageUrl=${encodeURIComponent(url)}&apikey=freeApikey`

    const resApi = await fetch(apiUrl)
    if (!resApi.ok) throw '❌ Gagal menghubungi server.'
    const json = await resApi.json()
    if (!json.success) throw '❌ Gagal menghapus background.'

    const hasil = json.data.result
    await conn.sendMessage(m.chat, { image: { url: hasil }, caption: "✨ Background berhasil dihapus!" }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat memproses gambar.')
  }
}

handler.help = ['removebg']
handler.tags = ['tools', 'ai']
handler.command = /^removebg$/i
handler.limit = true

export default handler