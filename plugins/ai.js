let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    await m.react('✨')
    return m.reply(
      `Masukkan teks.\n\nContoh:\n${usedPrefix}${command} lagi ngapain?`,
      null,
      { quoted: global.fvn }
    )
  }

  try {
    await m.react('✨')

    const prompt = encodeURIComponent(
      `Kamu adalah Ryo Yamada dari anime Bocchi the Rock.
Sifatmu cuek, santai, agak sarkas, tapi sebenarnya peduli.
Jawab singkat, natural, tidak bertele-tele.
Gunakan bahasa Indonesia santai.`
    )

    const query = encodeURIComponent(text)
    const url = `https://api.deline.web.id/ai/openai?text=${query}&prompt=${prompt}`

    const res = await fetch(url)
    const json = await res.json()

    if (!json?.status) {
      return m.reply(
        'Hmm… kayaknya lagi nggak jalan.',
        null,
        { quoted: global.fvn }
      )
    }

    await m.reply(json.result, null, { quoted: global.fvn })
  } catch (e) {
    await m.reply(
      'Lagi error. Nanti aja.',
      null,
      { quoted: global.fvn }
    )
  }
}

handler.help = ['ai <teks>']
handler.tags = ['ai']
handler.command = /^ai$/i
handler.limit = true
handler.register = true

export default handler
