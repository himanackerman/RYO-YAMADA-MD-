let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} <username>`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/stalker/snackvideo?username=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ Username tidak ditemukan.')
    }

    const r = data.result

    const fields = [
      ['ID', r.id],
      ['Nama', r.name],
      ['Bio', r.description],
      ['Followers', r.followers],
      ['Total Like', r.total_like],
      ['Total Video', r.total_video]
    ]

    let caption = `   *SnackVideo Stalker*\n\n`

    for (const [key, value] of fields) {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === '-' ||
        value === false
      ) continue

      caption += `✿ ${key} : ${value}\n`
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: r.profile },
        caption: caption.trim()
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['snackvideostalk <username>']
handler.tags = ['stalk']
handler.command = /^(snackvideostalk|snackstalk|snackvideo)$/i
handler.register = true
handler.limit = true

export default handler