import axios from 'axios'
const handler = async (m, { conn }) => {
  try {
    let page = Math.floor(Math.random() * 10) + 1

    let { data } = await axios.get(
      `https://api.waifu.im/images?isNsfw=False&orderBy=Random&page=${page}&pageSize=30`
    )

    if (!data.items?.length) throw 'Tidak ada hasil ditemukan'

    let result = data.items[Math.floor(Math.random() * data.items.length)]

    let artist = result.artists?.[0]?.name || 'Unknown'
    let username = result.artists?.[0]?.twitter
      ? '@' + result.artists[0].twitter.split('/').pop()
      : '-'

    await new AIRich(conn)
      .setFooter(`
❀ Artist : ${artist}
❀ Username : ${username}

❀ Favorites : ${result.favorites}
❀ Resolution : ${result.width}x${result.height}
❀ Type : ${result.extension}
❀ Tags : ${result.tags?.map(v => v.name).join(', ') || '-'}
      `.trim())
      .addImage(result.url)
      .send(m.chat, { quoted: m })

  } catch (e) {
    throw `Error: ${e}`
  }
}

handler.help = ['waifu']
handler.tags = ['anime']
handler.command = /^(waifu)$/i
handler.limit = false

export default handler