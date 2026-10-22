let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} <uid>`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/stalker/freefire?uid=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ UID tidak ditemukan.')
    }

    const r = data.result

    const fields = [
      ['UID', r.uid],
      ['Nickname', r.name],
      ['Region', r.region],
      ['Level', r.level],
      ['EXP', r.exp],
      ['Likes', r.likes],
      ['Signature', r.signature],
      ['Title', r.title],
      ['BR Rank', r.br_rank],
      ['BR Max Rank', r.br_max_rank],
      ['BR Point', r.br_rank_point],
      ['CS Rank', r.cs_rank],
      ['CS Max Rank', r.cs_max_rank],
      ['CS Point', r.cs_rank_point],
      ['Credit Score', r.credit_score],
      ['Season', r.season_id],
      ['Language', r.language],
      ['Mode', r.mode_prefer],
      ['Pet', r.pet_name],
      ['Pet Level', r.pet_level],
      ['Pet EXP', r.pet_exp],
      ['Guild', r.guild_name],
      ['Guild ID', r.guild_id && r.guild_id !== 'None' ? r.guild_id : null],
      ['Guild Level', r.guild_level],
      ['Guild Member', r.guild_member],
      ['Created', r.created_at],
      ['Last Login', r.last_login],
      ['Last Updated', r.last_updated],
      ['Release', r.release_version],
      ['Source', r.source]
    ]

    let caption = '   *Free Fire Stalker*\n\n'

    for (const [key, value] of fields) {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'None'
      ) continue

      caption += `✿ ${key} : ${value}\n`
    }

    await m.react('✅')
    m.reply(caption.trim())
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['ffstalk <uid>']
handler.tags = ['stalk']
handler.command = /^(ffstalk|freefire|ff)$/i
handler.register = true
handler.limit = true

export default handler