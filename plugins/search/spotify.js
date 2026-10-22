let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Swim Chase Atlantic`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/search/spotify?q=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status || !data.result?.length) {
      await m.react('❌')
      return m.reply('❌ Lagu tidak ditemukan.')
    }

    const list = data.result.slice(0, 10)

    let caption = `   *Spotify Search*\n\n`

    for (let i = 0; i < list.length; i++) {
      const v = list[i]
      caption += `${i + 1}. *${v.title}*\n`
      caption += `✿ Artist : ${v.artist}\n`
      caption += `✿ Album : ${v.album}\n`
      caption += `✿ Duration : ${v.duration}\n`
      caption += `✿ Release : ${v.release_date}\n`
      caption += `✿ Popularity : ${v.popularity}\n`
      caption += `✿ URL : ${v.url}\n\n`
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: list[0].thumbnail },
        caption
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

handler.help = ['spotifysearch <query>']
handler.tags = ['search']
handler.command = /^(spotifysearch|spotifys|spsearch)$/i
handler.register = true
handler.limit = true

export default handler