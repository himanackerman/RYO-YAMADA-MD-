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

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  let q = m.quoted
  if (!q) {
    return conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar lalu ketik *.fakeml teksnya*' },
      { quoted: global.fkontak }
    )
  }

  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) {
    return conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar lalu ketik *.fakeml teksnya*' },
      { quoted: global.fkontak }
    )
  }

  let buffer = await q.download().catch(() => null)
  if (!buffer) return

  let ext = mime.split('/')[1] || 'jpg'
  let tempFile = path.join(process.cwd(), `fakeml_${Date.now()}.${ext}`)
  fs.writeFileSync(tempFile, buffer)

  try {
    let avatarUrl = await uguu(tempFile)

    let apiUrl = `${global.APIs.deline}/maker/fakeml?text=${encodeURIComponent(text)}&avatar=${encodeURIComponent(avatarUrl)}`
    let res = await fetch(apiUrl)
    if (!res.ok) throw 'API error'

    let resultBuffer = await res.buffer()

    await conn.sendMessage(
      m.chat,
      {
        image: resultBuffer,
        caption: '✨ Fake ML Chat'
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

handler.help = ['fakeml <teks>']
handler.tags = ['maker']
handler.command = /^fakeml$/i
handler.limit = true

export default handler
