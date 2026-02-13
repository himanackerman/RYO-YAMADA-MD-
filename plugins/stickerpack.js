/**
* Get Sticker pack 
* Source Scrape : https://whatsapp.com/channel/0029VbB1IEFICVft683rXG1P
* Author : Hilman 
**/

import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

class StickerPack {
  async search(query) {
    const res = await axios.post(
      'https://getstickerpack.com/api/v1/stickerdb/search',
      { query, page: 1 }
    ).then(v => v.data)

    return (res.data || []).map(v => ({
      name: v.title,
      slug: v.slug,
      download: v.download_counter
    }))
  }

  async detail(slug) {
    const res = await axios.get(
      `https://getstickerpack.com/api/v1/stickerdb/stickers/${slug}`
    ).then(v => v.data.data)

    return {
      title: res.title,
      stickers: (res.images || []).map(v => ({
        image: `https://s3.getstickerpack.com/${v.url}`,
        animated: v.is_animated !== 0
      }))
    }
  }
}

const scraper = new StickerPack()

let handler = async (m, { conn, args, usedPrefix, command }) => {

  if (args[0] === 'pick') {
    const slug = args[1]
    if (!slug) return

    try {
      const res = await scraper.detail(slug)
      if (!res.stickers.length) return m.reply('✨ Sticker kosong')

      const safeName = res.title
        .replace(/[*_`]/g, '')
        .replace(/\s*\n\s*/g, ' ')

      m.reply(`✨ Mengirim sticker dari ${safeName}`)

      const hasStatic = res.stickers.some(s => !s.animated)

      let sent = 0
      for (let s of res.stickers) {
        if (sent >= 10) break
        if (hasStatic && s.animated) continue

        try {
          const img = await axios.get(s.image, { responseType: 'arraybuffer' })
          const buffer = Buffer.from(img.data)

          const sticker = await createSticker(buffer, {
            pack: 'Ryo Yamada - MD',
            author: 'By Hilman',
            type: s.animated ? StickerTypes.FULL : StickerTypes.DEFAULT
          })

          await conn.sendMessage(m.chat, { sticker }, { quoted: m })

          sent++
          await new Promise(r => setTimeout(r, 1500))
        } catch {}
      }

      return m.reply(`✨ Selesai, terkirim ${sent} sticker dari ${safeName}`)
    } catch {
      return m.reply('✨ Gagal mengambil sticker pack')
    }
  }

  if (!args.length)
    return m.reply(`✨ Contoh:\n${usedPrefix + command} blue archive`)

  try {
    const packs = await scraper.search(args.join(' '))
    if (!packs.length) return m.reply('✨ Sticker pack tidak ditemukan')

    const rows = packs.slice(0, 10).map(p => ({
      title: p.name,
      description: `Download ${p.download}`,
      id: `${usedPrefix + command} pick ${p.slug}`
    }))

    await conn.sendMessage(m.chat, {
      text: '✨ HASIL STICKER PACK',
      footer: '✨ Klik untuk langsung kirim sticker',
      buttons: [
        {
          buttonId: 'stickerpack_select',
          buttonText: { displayText: '✨ Pilih Sticker' },
          type: 4,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
              title: 'Sticker Pack',
              sections: [
                {
                  title: 'Daftar Pack',
                  rows
                }
              ]
            })
          }
        }
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m })

  } catch {
    m.reply('✨ Sticker pack tidak ditemukan')
  }
}

handler.help = ['stickerpack <query>']
handler.tags = ['sticker']
handler.command = /^stickerpack$/i
handler.limit = true
handler.register = true

export default handler