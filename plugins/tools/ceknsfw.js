import axios from 'axios'
import FormData from 'form-data'

async function nsfwCheck(buffer) {
  const form = new FormData()
  form.append('image', buffer, 'image.jpg')

  const { data } = await axios.post(
    'https://nsfw-categorize.it/api/upload',
    form,
    {
      headers: form.getHeaders()
    }
  )

  if (data.status !== 'OK') throw data.reason || 'Gagal cek NSFW'

  return data.data
}

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime) throw `Reply/kirim gambar`
  if (!/image|webp/.test(mime)) throw `Format tidak didukung!`

  let media = await q.download()
  let res = await nsfwCheck(media)

  let klasifikasi = (res.classification || 'unknown').toLowerCase()
  let confidence = res.confidence || 0

  let teks = `✨ *Hasil NSFW Check*\n\n`
  teks += `• Classification: ${klasifikasi}\n`
  teks += `• Confidence: ${confidence}%`

  await conn.reply(m.chat, teks, m)
}

handler.help = ['nsfwcheck']
handler.tags = ['tools']
handler.command = /^(nsfwcheck|cek(ns)?fw)$/i
handler.limit = true

export default handler