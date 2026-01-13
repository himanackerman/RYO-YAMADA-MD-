// ToHijab
// API : https://api.nekolabs.my.id
// Author : Hilman
import fetch from 'node-fetch'
import FormData from 'form-data'

const FIXED_PROMPT_HIJAB = `Add a realistic hijab to the character in the picture, preserving facial features and clothing, in a natural style with realistic lighting.`

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

let handlerHijab = async (m, { conn, usedPrefix, command, text }) => {
  try {
    let url
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (/^https?:\/\//i.test(text)) {
      url = text
    } else if (mime && mime.startsWith('image/')) {
      m.reply('✨ Sedang menambahkan hijab…')
      let img = await q.download?.()
      if (!img) throw '❌ Gagal download gambar.'
      url = await uploadImageToCatbox(img)
    } else {
      return m.reply(`⚠️ Reply/kirim foto atau kasih link gambar dengan caption *${usedPrefix + command}*`)
    }

    const apiUrl = `https://api.nekolabs.my.id/ai/gemini/nano-banana?prompt=${encodeURIComponent(FIXED_PROMPT_HIJAB)}&imageUrl=${encodeURIComponent(url)}`

    const resApi = await fetch(apiUrl)
    if (!resApi.ok) throw '❌ Gagal menghubungi server.'
    const json = await resApi.json()
    if (!json.status) throw '❌ Gagal memproses gambar.'

    const hasil = json.result
    await conn.sendFile(m.chat, hasil, 'tohijab.jpg', '✨ Nih hasilnya pakai hijab!', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat memproses gambar.')
  }
}

handlerHijab.help = ['tohijab']
handlerHijab.tags = ['ai']
handlerHijab.command = /^tohijab$/i
handlerHijab.limit = true

export default handlerHijab