let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Ronaldo`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/stalker/twitter?username=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ Username tidak ditemukan.')
    }

    const r = data.result

    const fields = [
      ['ID', r.id],
      ['Username', r.username],
      ['Nama', r.name],
      ['Verified', r.verified ? 'Yes' : null],
      ['Verified Type', r.verified_type !== '-' ? r.verified_type : null],
      ['Bio', r.description],
      ['Location', r.location !== '-' ? r.location : null],
      ['Tweets', r.stats?.tweets],
      ['Followers', r.stats?.followers],
      ['Following', r.stats?.following],
      ['Likes', r.stats?.likes],
      ['Media', r.stats?.media],
      ['Created', r.created_at]
    ]

    let caption = `   *Twitter Stalker*\n\n`

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
        image: { url: r.profile.banner || r.profile.avatar },
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

handler.help = ['twitterstalk <username>']
handler.tags = ['stalk']
handler.command = /^(twitterstalk|twitter|xstalk)$/i
handler.register = true
handler.limit = true

export default handler