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
      { text: 'ℹ️ Cara pakai:\nReply gambar lalu ketik *.toblonde*' },
      { quoted: global.fkontak }
    )
  }

  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) {
    return conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar lalu ketik *.toblonde*' },
      { quoted: global.fkontak }
    )
  }

  let buffer = await q.download().catch(() => null)
  if (!buffer) return

  // buat temp file
  let ext = mime.split('/')[1] || 'png'
  let tempFile = path.join(process.cwd(), `toblonde_${Date.now()}.${ext}`)
  fs.writeFileSync(tempFile, buffer)

  try {
    // upload ke uguu
    let srcUrl = await uguu(tempFile)

    let apiUrl = `https://api-faa.my.id/faa/toblonde?url=${encodeURIComponent(srcUrl)}`
    let res = await fetch(apiUrl)
    if (!res.ok) throw 'API error'

    let resultBuffer = await res.buffer()

    await conn.sendMessage(
      m.chat,
      {
        image: resultBuffer,
        caption: '✨ To Blonde'
      },
      { quoted: global.fkontak }
    )
  } catch (e) {
    console.error(e)
    await conn.sendMessage(
      m.chat,
      { text: '❌ Gagal memproses gambar' },
      { quoted: global.fkontak }
    )
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
  }
}

handler.help = ['toblonde']
handler.tags = ['maker']
handler.command = /^toblonde$/i
handler.limit = true

export default handler