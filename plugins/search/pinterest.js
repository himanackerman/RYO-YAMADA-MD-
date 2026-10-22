let handler = async (m, { conn, text }) => {
  const input = (m.quoted ? m.quoted.text : text)?.trim()

  if (!input) {
    return m.reply('Mau cari apa di Pinterest?')
  }

  await m.reply('Sedang mencari gambar Pinterest...')

  try {
    const api = new URL(`${global.APIs.nexray}/search/pinterest`)
    api.searchParams.set('q', input)

    const response = await fetch(api, {
      signal: AbortSignal.timeout(20000)
    })

    if (!response.ok) throw 'Gagal'

    const data = await response.json()

    if (!data?.status || !data.result?.length) {
      return m.reply('Tidak ada hasil ditemukan.')
    }

    const album = data.result
      .filter(v => v.images_url)
      .slice(0, 10)
      .map((v, i) => ({
        image: v.images_url,
        caption: v.grid_title || `Gambar ${i + 1}`
      }))

    if (!album.length) {
      return m.reply('Tidak ada gambar ditemukan.')
    }

    await conn.sendAlbum(
      m.chat,
      album,
      { quoted: m, delay: 1500 }
    )
  } catch {
    m.reply('Gagal mengambil gambar.')
  }
}

handler.command = /^(pinterest|pin)$/i
handler.help = ['pinterest <query>']
handler.tags = ['search']
handler.register = true
handler.limit = true

export default handler