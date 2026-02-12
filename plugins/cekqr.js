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

let handler = async (m, { conn }) => {
  await m.react('✨')

  let q = m.quoted
  if (!q) {
    return conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar QR lalu ketik *.cekqr*' },
      { quoted: global.fkontak }
    )
  }

  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) {
    return conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar QR lalu ketik *.cekqr*' },
      { quoted: global.fkontak }
    )
  }

  let buffer = await q.download().catch(() => null)
  if (!buffer) return

  let ext = mime.split('/')[1] || 'png'
  let tempFile = path.join(process.cwd(), `cekqr_${Date.now()}.${ext}`)
  fs.writeFileSync(tempFile, buffer)

  try {
    let imageUrl = await uguu(tempFile)

    let apiUrl = `https://api.baguss.xyz/api/tools/cekqr?url=${encodeURIComponent(imageUrl)}`
    let res = await fetch(apiUrl)
    if (!res.ok) throw 'API error'

    let json = await res.json()
    if (!json.success) throw 'QR tidak terbaca'

    await conn.sendMessage(
      m.chat,
      {
        text: `✨ *Hasil Decode QR*\n\n${json.result}`
      },
      { quoted: global.fkontak }
    )
  } catch (e) {
    console.error(e)
    await conn.sendMessage(
      m.chat,
      { text: '❌ Gagal membaca QR' },
      { quoted: global.fkontak }
    )
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
  }
}

handler.help = ['cekqr']
handler.tags = ['tools']
handler.command = /^cekqr$/i
handler.limit = true

export default handler
