import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, args, command }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) return m.reply(`✨ Masukin teks dong!\nContoh: .${command} halo ArdikaOfc`)

  try {
    const url = `https://exsalapi.my.id/api/maker/anime-brat/vid?text=${encodeURIComponent(text)}&apikey=freepublic`
    let stiker = await sticker(false, url, global.stickpack, global.stickauth)

    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('yahh error')
  }
}

handler.help = ['animebratvid <teks>']
handler.tags = ['sticker']
handler.command = ['animebratvid', 'bratanimvid', 'bratanimevid']
handler.limit = true
handler.register = true

export default handler