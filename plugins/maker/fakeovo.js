import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text }) => {
  const amount = text.trim() || '5000002828'

  await m.react('🕒')

  try {
    const buffer = await scraper['fake-ovo'](amount)

    await conn.sendFile(
      m.chat,
      buffer,
      'fake-ovo.png',
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

handler.help = ['fakeovo']
handler.tags = ['maker']
handler.command = ['fakeovo']

export default handler