import scraper from '@zenaveline/scraper'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = q.mimetype || ''

  if (!/image/i.test(mime)) {
    return m.reply(`Reply sebuah foto dengan caption:

${usedPrefix + command} Hilman|Halo semuanya 😂`)
  }

  if (!text) {
    return m.reply(`Contoh:

${usedPrefix + command} Hilman|Halo semuanya 😂`)
  }

  const [username, ...msg] = text.split('|')
  const chat = msg.join('|').trim()

  if (!username?.trim() || !chat) {
    return m.reply(`Format salah.

Contoh:
${usedPrefix + command} Hilman|Halo semuanya 😂`)
  }

  await m.react('🕒')

  try {
    const dir = './tmp'
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const file = path.join(dir, `tt-${Date.now()}.jpg`)
    fs.writeFileSync(file, await q.download())

    try {
      const buffer = await scraper['tiktokdm-qc'](
        username.trim(),
        chat,
        file,
        null
      )

      await conn.sendFile(
        m.chat,
        buffer,
        'faketiktok.png',
        '',
        m
      )
    } finally {
      if (fs.existsSync(file)) fs.unlinkSync(file)
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw String(e?.message || e)
  }
}

handler.help = ['faketiktok']
handler.tags = ['maker']
handler.command = /^faketiktok$/i
handler.limit = true

export default handler