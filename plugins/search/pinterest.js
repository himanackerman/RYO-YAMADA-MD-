import pinterest from '../../lib/scrape/pinterest.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (m.quoted ? m.quoted.text : text)?.trim()

  if (!input) {
    return m.reply(`Mau cari apa di Pinterest?\n\n*Contoh:* ${usedPrefix + command} ryo yamada`)
  }

  await m.reply('Sedang mencari gambar Pinterest...')

  try {
    const { results } = await pinterest.search(input)

    if (!results?.length) {
      return m.reply('Tidak ada hasil ditemukan di Pinterest.')
    }

    // Ambil 10 gambar teratas
    const sliceResults = results.slice(0, 10)
    const albumTasks = sliceResults.map(async (v, i) => {
      try {
        const imgUrl = v.image || v.thumb
        const buf = await pinterest.download(imgUrl)
        return {
          image: buf,
          caption: `*\`Pinterest Result\`*\n\n✿ Title : ${v.title}\n✿ Author : ${v.author}\n✿ Link : ${v.url}`
        }
      } catch {
        return null
      }
    })

    const downloaded = await Promise.all(albumTasks)
    const album = downloaded.filter(Boolean)

    if (!album.length) {
      return m.reply('Gagal mengunduh gambar dari Pinterest.')
    }

    if (album.length >= 2) {
      return await conn.sendAlbum(m.chat, album, { quoted: m, delay: 1000 })
    } else {
      return await conn.sendMessage(m.chat, album[0], { quoted: m })
    }

  } catch (err) {
    console.error('Pinterest Search Error:', err)
    m.reply('Terjadi kesalahan saat mencari gambar di Pinterest.')
  }
}

handler.command = /^(pinterest|pin)$/i
handler.help = ['pinterest <query>']
handler.tags = ['search']
handler.register = true
handler.limit = true

export default handler
