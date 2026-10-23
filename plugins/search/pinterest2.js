let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return m.reply(
      `Masukkan kata kunci pencarian.\n\nContoh: *${usedPrefix + command} ryo yamada anime*`
    )
  }

  await m.react('🕒')

  try {
    const url = new URL(global.APIs.nexray + '/search/pinterest')
    url.searchParams.append('q', text.trim())

    const res = await fetch(url)
    const data = await res.json()

    if (
      !data?.status ||
      !Array.isArray(data.result) ||
      data.result.length === 0
    ) {
      await m.react('❌')
      return m.reply(' Hasil Pinterest tidak ditemukan.')
    }

    const results = data.result
      .filter(v => v?.images_url)
      .slice(0, 10)

    if (!results.length) {
      await m.react('❌')
      return m.reply(' Tidak ada gambar Pinterest yang valid ditemukan.')
    }

    const carousel = new Carousel(conn)
      .setBody(`*Pinterest Search*\n\n *Query* : ${text.trim()}`)
      .setFooter(`${results.length} Hasil`)

    for (const item of results) {
      const imageUrl = item.images_url
      const title = item.grid_title || 'Pinterest Image'

      carousel.addCard(
        await new Button(conn)
          .setTitle(title)
          .setBody(` *Title* : ${title}`)
          .setFooter('Pinterest Search')
          .setImage(imageUrl)
          .addUrl(' Open', imageUrl)
          .toCard()
      )
    }

    await carousel.send(m.chat, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error('[Pinterest Search]', e)
    await m.react('❌')
    await m.reply(` Gagal mencari Pinterest:\n${e.message || 'Terjadi kesalahan.'}`)
  }
}

handler.help = ['pinterest2 <query>']
handler.tags = ['search']
handler.command = /^(pin2|pinterest2)$/i
handler.register = false
handler.limit = true

export default handler
