import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text }) => {
  const q = m.quoted || m
  const mime = q.mimetype || ''

  if (!/image/.test(mime)) {
    throw `Reply gambar dengan caption:

.editimg <prompt>`
  }

  if (!text) throw 'Masukkan prompt.'

  await m.react('🕒')

  try {
    const buffer = await q.download()
    const result = await scraper.nanobanana(buffer, text)

    if (result.status !== 'success' || !result.image_url) {
      throw 'Gagal mengedit gambar.'
    }

    await conn.sendFile(
      m.chat,
      result.image_url,
      'edit.webp',
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

handler.help = ['editimg']
handler.tags = ['image']
handler.command = ['editimg', 'img2img']

export default handler