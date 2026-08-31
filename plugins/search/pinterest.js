import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply('✨ Mau cari apa di Pinterest?')
  }

  await m.reply('🔎 Sedang mencari gambar Pinterest...')

  try {
    const { data } = await axios.get(
      `${global.APIs.nexray}/search/pinterest`,
      {
        params: {
          q: text
        }
      }
    )

    if (!data?.status || !data.result?.length) {
      return m.reply('❌ Tidak ada hasil ditemukan.')
    }

    const album = data.result
      .map((v, i) => ({
        image: {
          url: v.images_url
        },
        caption: `📌 ${v.grid_title || `Gambar ${i + 1}`}

ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ`
      }))
      .filter(v => v.image.url)
      .slice(0, 10)

    await conn.sendMessage(
      m.chat,
      { album },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil hasil Pinterest.')
  }
}

handler.command = /^(pinterest|pin)$/i
handler.help = ['pinterest <query>']
handler.tags = ['search']
handler.register = true
handler.limit = true

export default handler