/* 
Fitur : Stiker nekopack
type : plugins esm
sumber : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K

*/

import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, command }) => {
  
  let available = [
    'smug', 'woof', 'gasm', '8ball', 'goose', 'cuddle', 'avatar', 'slap',
    'v3', 'pat', 'gecg', 'feed', 'fox_girl', 'lizard', 'neko', 'hug',
    'meow', 'kiss', 'wallpaper', 'tickle', 'spank', 'waifu', 'lewd', 'ngif'
  ]

  if (!available.includes(command)) return m.reply('Kategori tidak tersedia.')

  let res = await fetch(`https://nekos.life/api/v2/img/${command}`)
  if (!res.ok) throw 'Gagal ambil gambar.'
  let data = await res.json()
  let url = data.url

  let stiker = new Sticker(url, {
    pack: 'Ryo Yamada - MD',
    author: 'ʙy ʜɪʟᴍᴀɴ',
    type: 'full',
    categories: ['Anime'],
    id: command,
    quality: 70
  })

  let buffer = await stiker.toBuffer()
  await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
}

handler.command = /^(smug|woof|gasm|8ball|goose|cuddle|avatar|slap|v3|pat|gecg|feed|fox_girl|lizard|neko|hug|meow|kiss|wallpaper|tickle|spank|waifu|lewd|ngif)$/i
handler.tags = ['sticker']
handler.help = ['smug', 'woof', 'gasm', '8ball', 'goose', 'cuddle', 'avatar', 'slap', 'v3', 'pat', 'gecg', 'feed', 'fox_girl', 'lizard', 'neko', 'hug', 'meow', 'kiss', 'wallpaper', 'tickle', 'spank', 'waifu', 'lewd', 'ngif']

export default handler