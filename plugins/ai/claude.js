let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Halo`)
  }

  try {
    const res = await fetch(
      `${global.APIs.nexray}/ai/claude?text=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status || !data?.result) {
      return m.reply('Gagal mendapatkan respons AI.')
    }

    m.reply(data.result)
  } catch (e) {
    console.error(e)
    m.reply('Terjadi kesalahan.')
  }
}

handler.help = ['claude']
handler.tags = ['ai']
handler.command = /^(claude|claudeai)$/i
handler.register = false
handler.limit = true

export default handler