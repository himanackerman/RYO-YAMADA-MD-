import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '👀', key: m.key } })

    const res = await fetch('https://api.nekolabs.my.id/random/waifuim/ecchii')
    if (!res.ok) throw new Error(`❌ Gagal fetch: ${res.statusText}`)

    const buffer = await res.buffer()
    const contentType = res.headers.get('content-type')

    if (contentType.includes('image/gif')) {
      await conn.sendMessage(m.chat, { video: buffer, gifPlayback: true }, { quoted: m })
    } else if (contentType.includes('image')) {
      await conn.sendMessage(m.chat, { image: buffer }, { quoted: m })
    } else if (contentType.includes('video')) {
      await conn.sendMessage(m.chat, { video: buffer }, { quoted: m })
    } else {
      m.reply('❌ Gagal mengenali tipe media dari API.')
    }
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil konten dari API.')
  }
}

handler.help = ['wecchi']
handler.tags = ['nsfw']
handler.command = /^wecchi$/i
handler.premium = true
handler.limit = false

export default handler