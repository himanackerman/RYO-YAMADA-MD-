import axios from 'axios'
import { sticker } from '../../lib/sticker.js'

if (!global.getStickerSession) global.getStickerSession = {}

class StickerPack {
  async search(query) {
    try {
      const res = await axios.post(
        'https://getstickerpack.com/api/v1/stickerdb/search',
        { query, page: 1 },
        { timeout: 15000 }
      )

      if (!res.data?.data) return []

      return res.data.data.map(v => ({
        name: v.title,
        slug: v.slug,
        download: v.download_counter
      }))
    } catch (e) {
      console.log('Search error:', e.message)
      return []
    }
  }

  async detail(slug) {
    try {
      const res = await axios.get(
        `https://getstickerpack.com/api/v1/stickerdb/stickers/${slug}`,
        { timeout: 15000 }
      )

      const data = res.data?.data
      if (!data?.images) throw 'Invalid response'

      return {
        title: data.title,
        stickers: data.images.map(v => ({
          image: `https://s3.getstickerpack.com/${v.url}`,
          animated: v.is_animated !== 0
        }))
      }
    } catch (e) {
      console.log('Detail error:', e.message)
      throw 'Gagal ambil detail'
    }
  }
}

const scraper = new StickerPack()

async function sendStickerPack(conn, jid, stickers, title, quoted) {
  let size = 15
  let chunks = []

  for (let i = 0; i < stickers.length; i += size) {
    chunks.push(stickers.slice(i, i + size))
  }

  for (let chunk of chunks) {
    let stickerList = []

    for (let s of chunk) {
      try {
        const img = await axios.get(s.image, {
          responseType: 'arraybuffer',
          timeout: 15000
        })

        const buffer = Buffer.from(img.data)

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
      } catch (e) {
        console.log('convert error:', e.message)
      }
    }

    if (!stickerList.length) continue

    await conn.sendMessage(jid, {
      cover: { url: chunk[0].image },
      stickers: stickerList,
      name: `✨ ${title}`,
      publisher: 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍ提',
      description: 'ʙy ʜɪʟᴍᴀɴ'
    }, { quoted })

    await new Promise(r => setTimeout(r, 900))
  }
}

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args.length) {
    return m.reply(`Contoh:\n${usedPrefix + command} blue archive`)
  }

  const query = args.join(' ')
  const packs = await scraper.search(query)

  if (!packs.length) return m.reply('❌ Sticker pack tidak ditemukan.')

  global.getStickerSession[m.sender] = packs.slice(0, 10)

  let teks = `✨ *HASIL STICKER PACK*\n\n`
  packs.slice(0, 10).forEach((p, i) => {
    teks += `${i + 1}. ${p.name}\n`
    teks += `• Download: ${p.download}\n\n`
  })
  teks += `Ketik nomor (1-10)`

  m.reply(teks.trim())
}

handler.before = async function (m, { conn }) {
  if (!/^(10|[1-9])$/.test(m.text)) return

  const session = global.getStickerSession?.[m.sender]
  if (!session) return

  const pick = session[Number(m.text) - 1]
  if (!pick) return m.reply('Nomor tidak valid.')

  delete global.getStickerSession[m.sender]

  m.reply(`✨ Mengirim *${pick.name}*...`)

  let res
  try {
    res = await scraper.detail(pick.slug)
  } catch {
    return m.reply('❌ Gagal ambil data')
  }

  if (!res.stickers.length) return m.reply('Kosong.')

  let stickers = res.stickers.slice(0, 30)

  await sendStickerPack(
    conn,
    m.chat,
    stickers,
    res.title,
    m
  )
}

handler.help = ['stickerpack <query>']
handler.tags = ['sticker']
handler.command = /^stickerpack$/i
handler.limit = true

export default handler