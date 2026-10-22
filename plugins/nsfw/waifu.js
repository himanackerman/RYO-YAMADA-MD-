let handler = async (m, { conn, text, command }) => {
  try {
    await m.react('✨')

    let tag = text ? text.trim().toLowerCase() : 'waifu'
    
    if (command === 'hentai') tag = 'hentai'
    if (command === 'oppai') tag = 'oppai'
    if (command === 'milf') tag = 'milf'

    const res = await fetch(`https://api.waifu.im/images?IsNsfw=True&included_tags=${tag}`)
    const json = await res.json()

    if (!json.items || json.items.length === 0) {
      await m.react('❌')
      return m.reply(`❌ Tidak ada gambar ditemukan untuk tag: ${tag}`)
    }

    const img = json.items[0]

    await conn.sendMessage(m.chat, {
      image: { url: img.url },
      caption: ` Tag: \`${tag}\``
    }, { quoted: m })

    await m.react('🔥')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Gagal mengambil gambar dari server.')
  }
}

handler.help = ['waifunsfw', 'hentai', 'oppai', 'milf']
handler.tags = ['nsfw']
handler.command = /^(waifunsfw|hentai|oppai|milf)$/i
handler.group = false
handler.premium = true

export default handler