// • Cek QR
// • Type : Plugins ESM 
// • API : https://api.baguss.xyz
// • Author : Hilman 
import fetch from 'node-fetch'
import FormData from 'form-data'

async function uploadCatbox(buffer) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, 'file.jpg')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })

  const url = await res.text()
  if (!url.startsWith('http')) throw new Error('Gagal upload ke Catbox.')
  return url
}

let handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    if (!/image/.test(q.mimetype)) throw 'Kirim atau reply gambar QR untuk dibaca.'

    await m.reply('🍭 Membaca kode QR...')

    let img = await q.download()
    let imageUrl = await uploadCatbox(img)

    let api = `https://api.baguss.xyz/api/tools/cekqr?url=${encodeURIComponent(imageUrl)}`
    let res = await fetch(api)
    if (!res.ok) throw 'Gagal menghubungi API.'

    let json = await res.json()
    if (!json.success) throw 'QR tidak dapat dibaca.'

    await conn.reply(m.chat, `✨ *Hasil Decode QR:*\n${json.result}`, m)
  } catch (e) {
    console.error(e)
    await m.reply('🍬 Gagal membaca QR. Pastikan yang dikirim gambar QR yang jelas.')
  }
}

handler.help = ['cekqr']
handler.tags = ['tools']
handler.command = /^cekqr$/i
handler.limit = true

export default handler