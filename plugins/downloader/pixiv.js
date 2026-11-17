import pixiv from '../../lib/scrape/pixiv.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (m.quoted ? m.quoted.text : text)?.trim()

  if (!input) {
    return m.reply(
`Mau cari apa di Pixiv?

*Contoh Penggunaan:*
• *${usedPrefix + command} miku* (Cari gambar di Pixiv)
• *${usedPrefix + command} daily* (Album Top Ranking Harian)
• *${usedPrefix + command} weekly* (Album Top Ranking Mingguan)
• *${usedPrefix + command} 151801969* (Unduh karya via ID)
• *${usedPrefix + command} https://pixiv.net/artworks/151801969*`
    )
  }

  const rankingModes = ['daily', 'weekly', 'monthly', 'rookie', 'male', 'female']
  const isRanking = rankingModes.includes(input.toLowerCase())
  const idMatch = input.match(/artworks\/(\d+)/i) || input.match(/^(\d+)$/)

  try {
    // 1. Mode Ranking Pixiv (daily, weekly, monthly, rookie, dll)
    if (isRanking) {
      await m.reply(`Sedang mengambil album ranking Pixiv (${input.toLowerCase()})...`)

      const list = await pixiv.ranking({ mode: input.toLowerCase() })
      if (!list?.length) return m.reply('Tidak ada hasil ranking ditemukan.')

      const sliceList = list.slice(0, 10)
      const albumTasks = sliceList.map(async (v, i) => {
        try {
          const imgUrl = v.image || v.thumb
          const buf = await pixiv.download(imgUrl)
          return {
            image: buf,
            caption: `👑 *Rank #${v.rank}* - *${v.title}*\n👤 Author: ${v.author}\n👁️ Views: ${v.views?.toLocaleString() || '-'}\n🔗 ${v.url}`
          }
        } catch {
          return null
        }
      })

      const downloaded = await Promise.all(albumTasks)
      const album = downloaded.filter(Boolean)

      if (!album.length) return m.reply('Tidak ada gambar ditemukan.')

      if (album.length >= 2) {
        return await conn.sendAlbum(m.chat, album, { quoted: m, delay: 1500 })
      } else {
        return await conn.sendMessage(m.chat, album[0], { quoted: m })
      }
    }

    // 2. Mode Artwork by ID atau URL Pixiv
    if (idMatch) {
      const id = idMatch[1]
      await m.reply('Sedang mengunduh artwork Pixiv...')

      const art = await pixiv.detail(id)
      let pages = []
      try {
        pages = await pixiv.pages(id)
      } catch {}

      // Jika karya memiliki banyak halaman (multi-page/manga)
      if (pages.length > 1) {
        const slicePages = pages.slice(0, 10)
        const albumTasks = slicePages.map(async (p, i) => {
          try {
            const imgUrl = p.urls.regular || p.urls.small || p.urls.thumb
            const buf = await pixiv.download(imgUrl)
            return {
              image: buf,
              caption: `🎨 *${art.title}* (Halaman ${i + 1}/${pages.length})\n👤 Author: ${art.author}\n🔗 ${art.url}`
            }
          } catch {
            return null
          }
        })

        const downloaded = await Promise.all(albumTasks)
        const album = downloaded.filter(Boolean)

        if (album.length >= 2) {
          return await conn.sendAlbum(m.chat, album, { quoted: m, delay: 1500 })
        }
      }

      // Jika hanya 1 gambar
      const downloadUrl = art.urls.regular || art.urls.original || art.urls.small || art.urls.thumb
      if (!downloadUrl) return m.reply('Tidak ada gambar ditemukan.')

      const buf = await pixiv.download(downloadUrl)
      const caption =
`🎨 *${art.title}*
👤 Author: ${art.author} (ID: ${art.authorId})
❤️ Likes: ${art.likes?.toLocaleString() || '-'} | 🔖 Bookmarks: ${art.bookmarks?.toLocaleString() || '-'}
👁️ Views: ${art.views?.toLocaleString() || '-'}
🏷️ Tags: ${art.tags.slice(0, 5).map(t => '#' + t).join(' ')}
🔗 ${art.url}`

      return await conn.sendMessage(m.chat, { image: buf, caption }, { quoted: m })
    }

    // 3. Mode Pencarian Kata Kunci di Pixiv
    await m.reply(`Sedang mencari gambar "${input}" di Pixiv...`)

    const results = await pixiv.search(input)
    if (!results?.length) {
      return m.reply('Tidak ada hasil ditemukan.')
    }

    const sliceResults = results.slice(0, 10)
    const albumTasks = sliceResults.map(async (v, i) => {
      try {
        const regularUrl = v.thumb
          ? v.thumb.replace(/\/c\/[^\/]+\//, '/c/600x1200_90/').replace('_square1200', '_master1200')
          : v.thumb
        const buf = await pixiv.download(regularUrl)
        return {
          image: buf,
          caption: `🎨 *${v.title}* (${i + 1})\n👤 Author: ${v.author}\n🔗 ${v.url}`
        }
      } catch {
        return null
      }
    })

    const downloaded = await Promise.all(albumTasks)
    const album = downloaded.filter(Boolean)

    if (!album.length) {
      return m.reply('Tidak ada gambar ditemukan.')
    }

    if (album.length >= 2) {
      await conn.sendAlbum(m.chat, album, { quoted: m, delay: 1500 })
    } else {
      await conn.sendMessage(m.chat, album[0], { quoted: m })
    }

  } catch (e) {
    console.error('Pixiv Error:', e)
    m.reply('Gagal mengambil gambar.')
  }
}

handler.command = /^(pixiv|pixivdl|pixivsearch)$/i
handler.help = ['pixiv <query>']
handler.tags = ['search', 'downloader']
handler.register = true
handler.limit = true

export default handler
