let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} <username>`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/stalker/pinterest?username=${encodeURIComponent(text)}`
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
      ['Nama', r.full_name],
      ['Bio', r.bio !== '-' ? r.bio : null],
      ['Type', r.type],
      ['Pins', r.stats?.pins],
      ['Followers', r.stats?.followers],
      ['Following', r.stats?.following],
      ['Boards', r.stats?.boards],
      ['Likes', r.stats?.likes || null],
      ['Saves', r.stats?.saves || null],
      ['Website', r.website !== '-' ? r.website : null],
      ['Domain', r.domain_url !== '-' ? r.domain_url : null],
      ['Location', r.location !== '-' ? r.location : null],
      ['Country', r.country !== '-' ? r.country : null],
      ['Verified', Object.keys(r.is_verified || {}).length ? 'Yes' : null],
      ['Partner', r.is_partner ? 'Yes' : null],
      ['Account Type', r.account_type !== '-' ? r.account_type : null],
      ['Created', r.created_at],
      ['Last Login', r.last_login !== '-' ? r.last_login : null],
      ['Twitter', r.social_links?.twitter !== '-' ? r.social_links?.twitter : null],
      ['Facebook', r.social_links?.facebook !== '-' ? r.social_links?.facebook : null],
      ['Instagram', r.social_links?.instagram !== '-' ? r.social_links?.instagram : null],
      ['YouTube', r.social_links?.youtube !== '-' ? r.social_links?.youtube : null],
      ['Etsy', r.social_links?.etsy !== '-' ? r.social_links?.etsy : null],
      ['Profile', r.profile_url]
    ]

    let caption = `   *Pinterest Stalker*\n\n`

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
        image: { url: r.image.original },
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

handler.help = ['pintereststalk <username>']
handler.tags = ['stalk']
handler.command = /^(pintereststalk|pinstalk|pstalk)$/i
handler.register = true
handler.limit = true

export default handler