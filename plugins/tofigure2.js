// ToFigure v2
// API : https://api.nekolabs.my.id
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
      m.reply('✨ Lagi bikin figure (v2), tunggu bentar ya…')
      let img = await q.download?.()
      if (!img) throw '❌ Gagal download gambar.'
      url = await uploadImageToCatbox(img)
    } else {
      return m.reply(`⚠️ Reply/kirim foto atau kasih link gambar dengan caption *${usedPrefix + command}*`)
    }

    const apiUrl = `https://api.nekolabs.my.id/ai/convert/tofigure?imageUrl=${encodeURIComponent(url)}`

    const resApi = await fetch(apiUrl)
    if (!resApi.ok) throw '❌ Gagal menghubungi server.'
    const json = await resApi.json()
    if (!json.status) throw '❌ Gagal membuat figure (v2).'

    const hasil = json.result
    await conn.sendFile(m.chat, hasil, 'tofigure2.jpg', '✨ Nih hasilnya jadi figure (v2)!', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat memproses gambar.')
  }
}

handler.help = ['tofigure2']
handler.tags = ['ai']
handler.command = /^tofigure2$/i
handler.limit = true

export default handler