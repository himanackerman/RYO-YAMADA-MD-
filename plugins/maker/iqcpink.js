import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Halo Hilman`)
  }

  await m.react('🕒')

  try {
    const time = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const buffer = await scraper['iqc-pinkmode'](
      text,
      time,
      null
    )

    await conn.sendFile(
      m.chat,
      buffer,
      'iqcpink.png',
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

handler.help = ['iqc3', 'iqcpink']
handler.tags = ['maker']
handler.command = ['iqc3', 'iqcpink']

export default handler