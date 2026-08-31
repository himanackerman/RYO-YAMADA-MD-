/*
* Fitur : Stickerly send stickerpack (With Watermark EXIF Support)
* Type : Plugins ESM 
* Creator : Hilman
* Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import axios from 'axios'
import { sticker } from '../../lib/sticker.js'

if (!global.stickerlyCache) global.stickerlyCache = {}

class StickerLy {
  async search(keyword) {
    try {
      const { data } = await axios.post(
        'https://api.sticker.ly/v4/stickerPack/smartSearch',
        {
          keyword,
          enabledKeywordSearch: true,
          filter: {
            extendSearchResult: false,
            sortBy: 'RECOMMENDED',
            languages: ['ALL'],
            minStickerCount: 5,
            searchBy: 'ALL',
            stickerType: 'ALL'
          }
        },
        {
          headers: {
            'User-Agent': 'androidapp.stickerly/3.31.0 (M2006C3LG; U; Android 29; in-ID; id;)',
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      )

      let packs =
        data?.result?.stickerPacks ||
        data?.stickerPacks ||
        data?.data ||
        []

      return packs.map(v => ({
        id: v.packId,
        name: v.name,
        author: v.authorName || 'Unknown',
        count: v.resourceFiles?.length || 0,
        animated: v.isAnimated,
        prefix: v.resourceUrlPrefix,
        files: v.resourceFiles || [],
        url: v.shareUrl || `https://sticker.ly/s/${v.packId}`
      }))
    } catch (e) {
      console.log('Stickerly Search Error:', e.message)
      return []
    }
  }
}

const scraper = new StickerLy()

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh:\n${usedPrefix + command} patrick`

  if (text.startsWith('pack|')) {
    const packId = text.split('|')[1]
    const pick = global.stickerlyCache[packId]

    if (!pick) throw '❌ Sesi kadaluarsa, silakan cari ulang.'

    await m.reply(`❀ Mengirim *${pick.name}*\n❀ Total Sticker: ${pick.files.length}\n❀ Memproses watermark...`)

    const listFiles = pick.files.slice(0, 30)
    if (!listFiles.length) throw '❌ Sticker kosong.'

    const packname = global.packname || 'ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ'
    const author = global.author || 'ʙʏ ʜɪʟᴍᴀɴ'

    // Proses konversi gambar ke stiker ber-watermark (buffer)
    const stickers = []
    for (const file of listFiles) {
      try {
        const url = pick.prefix + file
        let stikerBuff = await sticker(null, url, packname, author)
        
        if (stikerBuff) {
          stickers.push({
            data: stikerBuff
          })
        }
      } catch (err) {
        console.error('Gagal convert stiker WM:', err)
      }
    }

    if (!stickers.length) throw '❌ Gagal memproses stiker.'

    const coverUrl = pick.prefix + listFiles[0]

    // Kirim menggunakan struktur Sticker Pack Baileys
    return await conn.sendMessage(m.chat, {
      cover: { url: coverUrl },
      stickers: stickers,
      name: pick.name,
      publisher: author,
      description: packname
    }, { quoted: m })
  }

  const packs = await scraper.search(text)

  if (!packs.length) throw '❌ Sticker pack tidak ditemukan.'

  const rows = packs.map(v => {
    global.stickerlyCache[v.id] = v

    return {
      title: v.name,
      description: `${v.author} | ${v.count} sticker`,
      id: `${usedPrefix + command} pack|${v.id}`
    }
  })

  return await conn.sendMessage(m.chat, {
    image: { url: packs[0].files[0] ? packs[0].prefix + packs[0].files[0] : undefined },
    caption: `❀ Hasil pencarian: ${text}\nTotal ditemukan: ${packs.length} pack`,
    footer: 'Sticker.ly',
    nativeFlow: [{
      text: '❀ Pilih Pack',
      sections: [{
        title: 'Daftar Sticker Pack',
        rows
      }]
    }]
  }, { quoted: m })
}

handler.help = ['stickerly']
handler.tags = ['sticker']
handler.command = /^stickerly$/i
handler.limit = true
handler.register = true

export default handler