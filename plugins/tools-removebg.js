import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

async function uguu(filePath) {
  const form = new FormData()
  form.append('files[]', fs.createReadStream(filePath))
  const { data } = await axios.post('https://uguu.se/upload', form, {
    headers: { ...form.getHeaders() }
  })
  return data.files[0].url
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

      let buffer = await q.download?.()
      if (!buffer) throw '❌ Gagal download gambar.'

      let ext = mime.split('/')[1] || 'png'
      let tempFile = path.join(process.cwd(), `removebg_${Date.now()}.${ext}`)
      fs.writeFileSync(tempFile, buffer)

      url = await uguu(tempFile)

      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
    } else {
      return m.reply(`⚠️ Reply/kirim foto atau kasih link gambar dengan caption *${usedPrefix + command}*`)
    }

    const apiUrl = `https://anabot.my.id/api/ai/removebg?imageUrl=${encodeURIComponent(url)}&apikey=freeApikey`

    const resApi = await fetch(apiUrl)
    if (!resApi.ok) throw '❌ Gagal menghubungi server.'
    const json = await resApi.json()
    if (!json.success) throw '❌ Gagal menghapus background.'

    const hasil = json.data.result

    await conn.sendMessage(
      m.chat,
      { image: { url: hasil }, caption: "✨ Background berhasil dihapus!" },
      { quoted: m }
    )
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