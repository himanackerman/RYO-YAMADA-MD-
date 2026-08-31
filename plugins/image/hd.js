import scraper from '@zenaveline/scraper'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/^image\//.test(mime)) {
    return m.reply('Kirim atau reply sebuah foto dengan caption *.hd*')
  }

  try {
    await m.react('🕒')

    const media = await q.download()
    const tmpDir = './tmp'

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    const file = path.join(tmpDir, `hd-${Date.now()}.jpg`)
    fs.writeFileSync(file, media)

    const res = await scraper.sharpify(file, 'upscale')

    fs.unlinkSync(file)

    if (!res?.url) throw new Error('Gagal meng-upscale gambar.')

    await conn.sendFile(
      m.chat,
      res.url,
      'hd.png',
      '',
      m
    )

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    throw e
  }
}

handler.help = ['hd']
handler.tags = ['image']
handler.command = /^hd$/i
handler.limit = true
handler.register = false

export default handler