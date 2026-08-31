import axios from 'axios'
import { sticker } from '../../lib/sticker.js'

const botToken = '7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc'

const telestick = async (url) => {
  const match = url.match(/https:\/\/t\.me\/addstickers\/([^\/\?#]+)/)
  if (!match) throw 'URL tidak valid!'

  const { data: a } = await axios.get(
    `https://api.telegram.org/bot${botToken}/getStickerSet?name=${match[1]}`
  )

  const stickers = await Promise.all(
    a.result.stickers.map(async (sticker) => {
      const { data: b } = await axios.get(
        `https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`
      )

      return {
        is_animated: sticker.is_animated,
        is_video: sticker.is_video,
        url: `https://api.telegram.org/file/bot${botToken}/${b.result.file_path}`
      }
    })
  )

  return {
    title: a.result.title,
    stickers
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `Masukkan URL!\nContoh:\n.${command} https://t.me/addstickers/xxxx`

  try {
    const res = await telestick(text)

    await m.reply(`✨ Mengambil pack...\n*${res.title}*`)

    let filtered = res.stickers.filter(s => !s.is_video)

    if (!filtered.length) {
      filtered = res.stickers.slice(0, 30)
    }

    await sendStickerPack(conn, m.chat, filtered, res.title, m)

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal ambil sticker.')
  }
}

handler.help = ['telestick']
handler.tags = ['sticker']
handler.command = /^telestick$/i
handler.limit = false
handler.premium = true

export default handler

async function sendStickerPack(conn, jid, stickers, title, quoted) {
  let all = stickers.slice(0, 120)
  let size = 60
  let chunks = []

  for (let i = 0; i < all.length; i += size) {
    chunks.push(all.slice(i, i + size))
  }

  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i]
    let stickerList = []

    for (let s of chunk) {
      try {
        const { data } = await axios.get(s.url, {
          responseType: 'arraybuffer',
          timeout: 20000
        })

        const buffer = Buffer.from(data)

        // sticker(img, url, packname, author)
        const stickerBuffer = await sticker(
          buffer,
          false,
          'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ',
          'ʙʏ ʜɪʟᴍᴀɴ'
        )

        if (stickerBuffer) {
          stickerList.push({ data: stickerBuffer })
        }

        await new Promise(r => setTimeout(r, 120))

      } catch (e) {
        console.log('skip:', e.message)
      }
    }

    if (!stickerList.length) continue

    await conn.sendMessage(jid, {
      cover: { url: chunk[0].url },
      stickers: stickerList,
      name: `✨ ${title}`,
      publisher: 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ',
      description: 'ʙʏ ʜɪʟᴍᴀɴ'
    }, { quoted })

    await new Promise(r => setTimeout(r, 1500))
  }
}