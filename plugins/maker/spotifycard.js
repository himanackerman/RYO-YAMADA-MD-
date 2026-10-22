import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = q.mimetype || ''

  if (!/image/i.test(mime)) {
    return m.reply(`Reply sebuah foto dengan caption:

${usedPrefix + command} Judul Lagu|Nama Artist`)
  }

  if (!text) {
    return m.reply(`Contoh:

${usedPrefix + command} Swim|Chase Atlantic`)
  }

  const [title, artist] = text.split('|').map(v => v.trim())

  if (!title || !artist) {
    return m.reply(`Format salah.

Contoh:
${usedPrefix + command} Swim|Chase Atlantic`)
  }

  await m.react('🕒')

  try {
    const cover = await q.download()

    const buffer = await scraper.spotifycard({
      cover,
      title,
      artist
    })

    await conn.sendFile(
      m.chat,
      buffer,
      'spotifycard.png',
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

handler.help = ['spotifycard']
handler.tags = ['maker']
handler.command = /^spotifycard$/i
handler.limit = true

export default handler