import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '👀', key: m.key } })

    const res = await fetch('https://api.nekolabs.my.id/random/waifuim/oppai')
    const buffer = await res.buffer()
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('image/gif')) {
      await conn.sendMessage(m.chat, { video: buffer, gifPlayback: true }, { quoted: m })
    } else if (contentType.includes('image')) {
      await conn.sendMessage(m.chat, { image: buffer }, { quoted: m })
    } else {
      m.reply('❌ Gagal mengidentifikasi tipe file dari API.')
    }
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil konten.')
  }
}

handler.command = ['woppai']
handler.tags = ['nsfw']
handler.help = ['woppai']
handler.premium = true
handler.limit = true

export default handler