import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.waifu.pics/sfw/waifu')
    let json = await res.json()

    let img = json.url
    let imgRes = await fetch(img)
    let buffer = await imgRes.buffer()

    await conn.sendFile(m.chat, buffer, 'waifu.jpg', '✨ Random Waifu', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal ambil gambar waifu.')
  }
}

handler.help = ['waifu3']
handler.tags = ['anime']
handler.command = /^(waifu3)$/i
handler.limit = true

export default handler