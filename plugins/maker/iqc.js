import scraper from '@zenaveline/scraper'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = q.mimetype || ''

  let msg = ''
  let customTime = ''

  if (text) {
    ;[msg, customTime] = text.split('|').map(v => v.trim())
  }

  const time = customTime || new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(':', '.')

  if (!/image/i.test(mime) && !msg && !q.text) {
    return m.reply(`Contoh:
${usedPrefix + command} Halo Hilman
${usedPrefix + command} Halo Hilman|18.31

Atau reply foto:
${usedPrefix + command} Caption`)
  }

  if (!msg && q.text) msg = q.text

  await m.react('🕒')

  try {
    let buffer

    if (/image/i.test(mime)) {
      const media = await q.download()

      const dir = './tmp'
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

      const file = path.join(dir, `iqc-${Date.now()}.jpg`)
      fs.writeFileSync(file, media)

      try {
        buffer = await scraper['iqc-darkmode']({
          txt: msg || '',
          timeStr: time,
          imgUrl: file
        })
      } finally {
        if (fs.existsSync(file)) fs.unlinkSync(file)
      }
    } else {
      buffer = await scraper['iqc-darkmode']({
        txt: msg,
        timeStr: time,
        imgUrl: null
      })
    }

    await conn.sendFile(
      m.chat,
      buffer,
      'iqcdark.png',
      '',
      m
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw String(e?.message || e)
  }
}

handler.help = ['iqc']
handler.tags = ['maker']
handler.command = ['iqc']

export default handler