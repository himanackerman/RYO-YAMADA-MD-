import axios from 'axios'

const telestick = async (url) => {
  try {
    const match = url.match(/https:\/\/t\.me\/addstickers\/([^\/\?#]+)/)
    if (!match) throw 'URL tidak valid!'

    const { data: a } = await axios.get(`https://api.telegram.org/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/getStickerSet?name=${match[1]}`)

    const stickers = await Promise.all(
      a.result.stickers.map(async (sticker) => {
        const { data: b } = await axios.get(`https://api.telegram.org/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/getFile?file_id=${sticker.file_id}`)
        return {
          emoji: sticker.emoji,
          is_animated: sticker.is_animated,
          image_url: `https://api.telegram.org/file/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/${b.result.file_path}`
        }
      })
    )

    return {
      name: a.result.name,
      title: a.result.title,
      sticker_type: a.result.sticker_type,
      stickers
    }
  } catch (e) {
    throw 'Gagal mengambil sticker set'
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `*Masukkan URL sticker Telegram!*\nContoh:\n${command} https://t.me/addstickers/xxxxxx`

  try {
    const res = await telestick(text)
    await conn.reply(m.chat, `*Nama Pack:* ${res.title}\n*Jumlah:* ${res.stickers.length} sticker\n`, m)

    for (let sticker of res.stickers) {
      await conn.sendFile(m.chat, sticker.image_url, 'sticker.webp', sticker.emoji || '', m)
      await delay(500)
    }
  } catch (e) {
    console.log(e)
    await conn.reply(m.chat, '❌ *Gagal mengambil sticker!*\nPastikan link valid dan coba lagi.', m)
  }
}

handler.help = ['telestick <url>']
handler.tags = ['sticker']
handler.command = /^telestick$/i
handler.limit = false;
handler.premium = true

export default handler

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}