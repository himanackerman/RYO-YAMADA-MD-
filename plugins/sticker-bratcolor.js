import fetch from 'node-fetch'
import { sticker3 } from '../lib/sticker.js'

let handler = async (m, { conn, args, text, command }) => {
  let teks = text || 'halo hilman'
  let warna = 'navy'

  const warnaList = [
    'hijau','ungu','pink','merah','biru','emas','kuning','abuabu','silver','hitam','oranye','cokelat','putih','perunggu',
    'turquoise','magenta','cyan','beige','krem','lavender','teal','maroon','salmon','mustard','olive','coral','violet',
    'indigo','khaki','burgundy','sienna','amber','peach','lime','mint','rose','aquamarine','navy','scarlet','cerulean',
    'chartreuse','tan','mauve','slate','rust','topaz','charcoal','ivory'
  ]

  if (!text.includes('|')) {
    let listWarna = warnaList.join(', ')
    return m.reply(`❌ Format salah.\n\nContoh:\n*.${command} teksnya | warnanya*\n\nWarna yang tersedia:\n${listWarna}`)
  }

  let [isi, col] = text.split('|').map(v => v.trim())
  teks = isi || 'halo hilman'
  warna = col.toLowerCase() || 'navy'

  if (!warnaList.includes(warna)) {
    return m.reply(`❌ Warna *${warna}* tidak tersedia.\n\nWarna yang bisa dipilih:\n${warnaList.join(', ')}`)
  }

  try {
    if (conn.react) await conn.react(m.chat, '🎨', m.key)

    let api = `https://velyn.mom/api/maker/bratcolor?text=${encodeURIComponent(teks)}&color=${encodeURIComponent(warna)}`
    let res = await fetch(api)
    let buffer = await res.buffer()

    let stiker = await sticker3(buffer, false, 'Ryo Yamada - MD', 'By Hilman')
    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
    if (conn.react) await conn.react(m.chat, '✅', m.key)

  } catch (e) {
    console.error(e)
    if (conn.react) await conn.react(m.chat, '❌', m.key)
    m.reply(`❌ Gagal bikin stiker.\n${e}`)
  }
}

handler.help = ['bratcolor <teks>|<warna>']
handler.tags = ['sticker']
handler.command = /(brcolor|bratcolor)$/i
handler.limit = true

export default handler
// https://velyn.mom/api/maker/bratcolor?text=