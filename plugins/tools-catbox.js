import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) throw `Balas media dengan perintah *${usedPrefix + command}*`

  try {
    const media = await q.download()
    const ext = mime.split('/')[1] || 'bin'
    const filePath = path.join(tmpdir(), `upload-${Date.now()}.${ext}`)
    fs.writeFileSync(filePath, media)

    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', fs.createReadStream(filePath))

    const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
    })

    fs.unlinkSync(filePath)
    m.reply(`✅ *Upload berhasil!*\n${data}`)
  } catch (err) {
    console.error('❌ Error upload:', err)
    throw '❌ Gagal upload ke catbox.moe'
  }
}

handler.help = ['catbox']
handler.tags = ['tools']
handler.command = /^catbox$/i
handler.limit = true

export default handler