let handler = async (m) => {
  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/information/jadwalbola`
    )
    const data = await res.json()

    if (!data?.status || !data.result?.length) {
      await m.react('❌')
      return m.reply('❌ Jadwal bola tidak ditemukan.')
    }

    const caption = `   *Jadwal Bola*

${data.result.map((v, i) => `${i + 1}. ${v}`).join('\n')}`

    await m.react('✅')
    m.reply(caption)
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['jadwalbola']
handler.tags = ['info']
handler.command = /^(jadwalbola|bola)$/i
handler.register = true
handler.limit = true

export default handler