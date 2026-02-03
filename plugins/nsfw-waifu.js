import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://api.sxtream.xyz/dewasa/waifu')
    if (!res.ok) throw `❌ HTTP error ${res.status} ${res.statusText}`

    const buffer = await res.buffer()

    await conn.sendFile(m.sender, buffer, 'waifu.jpg', '🔞 Random NSFW Waifu', m)
  } catch (e) {
    console.error(e)
    await m.reply('❌ Terjadi kesalahan: ' + e.toString())
  }
}

handler.help = ['waifunsfw']
handler.tags = ['nsfw']
handler.command = /^waifunsfw$/i
handler.premium = true
handler.group = false

export default handler