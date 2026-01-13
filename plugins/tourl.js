import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

const SUPPORTED_MIME = ['image/', 'video/', 'audio/', 'application/pdf']

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return m.reply(`⚠️ Balas media dengan perintah *${usedPrefix + command}*`)

  if (!SUPPORTED_MIME.some(type => mime.startsWith(type))) {
    return m.reply(`⚠️ Tipe file tidak didukung, gunakan gambar, video, audio, atau pdf.`)
  }

  let ext = mime.split('/')[1] || 'bin'
  let filePath = path.join(tmpdir(), `upload-${Date.now()}.${ext}`)

  try {
    const media = await q.download()
    fs.writeFileSync(filePath, media)

    await m.reply(`Otw...`)

    // Upload ke cloudkuimages
    const form1 = new FormData()
    form1.append('file', fs.createReadStream(filePath))
    let res1
    try {
      let { data } = await axios.post('https://cloudkuimages.guru/upload.php', form1, {
        headers: {
          ...form1.getHeaders(),
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://cloudkuimages.guru/'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      })
      if (typeof data === 'string') {
        try { data = JSON.parse(data) } catch { data = data.replace(/\\/g, '') }
      }
      res1 = data?.url || data?.link || data?.data?.url || data?.data?.link || data
    } catch (e) {
      console.error('❌ Cloudku error =>', e.message)
      res1 = '❌ Gagal upload ke cloudkuimages.guru'
    }

    // Upload ke catbox.moe
    const form2 = new FormData()
    form2.append('reqtype', 'fileupload')
    form2.append('fileToUpload', fs.createReadStream(filePath))
    let res2
    try {
      let { data } = await axios.post('https://catbox.moe/user/api.php', form2, {
        headers: form2.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      })
      res2 = data
    } catch (e) {
      console.error('❌ Catbox error =>', e.message)
      res2 = '❌ Gagal upload ke catbox.moe'
    }

    const message = [
      '✅ *Upload selesai!*',
      '——————',
      `📂 *Tipe File:* ${mime}`,
      `☁️ Cloudku: ${res1}`,
      `📦 Catbox: ${res2}`,
      '——————',
      '📢 Silahkan pilih salah satu link di atas.'
    ].join('\n')

    await m.reply(message)
  } catch (err) {
    console.error('❌ Error upload:', err)
    await m.reply('❌ Gagal upload file, coba lagi nanti.')
  } finally {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch {}
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^tourl$/i
handler.limit = false

export default handler