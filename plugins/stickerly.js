/*
  StickerLy Search + Pick Number + Kirim Sticker (Delay 3 Detik)
  Cara pakai:
  • .stly ryo yamada 
  • .stly 1
  source : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
  source Scrape : https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/542
*/

import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

const baseURL = 'https://api.sticker.ly/v4'
if (!global.stickerlySession) global.stickerlySession = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `Contoh pemakaian:\n` +
      `• ${usedPrefix + command} blue archive\n` +
      `• ${usedPrefix + command} 1`
    )
  }

  const firstArg = args[0]
  const isNumber = /^\d+$/.test(firstArg)
  const session = global.stickerlySession[m.sender]

  if (isNumber && session) {
    let idx = parseInt(firstArg) - 1
    let pack = session[idx]
    if (!pack) return m.reply('Nomor pack tidak valid.')

    delete global.stickerlySession[m.sender]

    m.reply(`Mengambil stiker dari ${pack.name} ...\nTunggu sebentar.`)

    try {
      let match = pack.shareUrl.match(/\/s\/([^\/\?#]+)/)
      if (!match) return m.reply('Gagal membaca URL sticker pack.')

      let { data } = await axios.get(
        `${baseURL}/stickerPack/${match[1]}?needRelation=true`,
        {
          headers: {
            'user-agent': 'androidapp.stickerly/3.17.0',
            'content-type': 'application/json',
          },
        }
      )

      let stickers = data.result.stickers || []
      let prefix = data.result.resourceUrlPrefix

      if (!stickers.length) return m.reply('Tidak ada stiker ditemukan.')

      let sent = 0

      for (let s of stickers) {
        
        if (s.isAnimated) continue

        let url = prefix + s.fileName

        try {
          let img = await axios.get(url, { responseType: 'arraybuffer' })
          let buffer = Buffer.from(img.data)

          let stiker = await createSticker(buffer, {
            pack: 'Ryo Yamada - MD',
            author: 'By Hilman',
            type: StickerTypes.DEFAULT
          })

          await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
          sent++

          // Jeda 3 detik kalian setting aja jeda nya
          await new Promise(resolve => setTimeout(resolve, 3000))

        } catch (e) {
          console.log('Gagal kirim sticker:', e?.message || e)
        }
      }

      if (!sent) return m.reply('Tidak ada stiker static yang bisa dikirim.')

      m.reply(`✔ Selesai, terkirim ${sent} stiker dari *${pack.name}*.`)
    } catch (err) {
      console.log(err)
      m.reply('Gagal mengambil detail pack.')
    }

    return
  }

  const query = args.join(' ')
  if (!query) return m.reply('Masukkan kata kunci pencarian.')

  try {
    const { data } = await axios.post(
      `${baseURL}/stickerPack/smartSearch`,
      {
        keyword: query,
        enabledKeywordSearch: true,
        filter: {
          extendSearchResult: false,
          sortBy: 'RECOMMENDED',
          languages: ['ALL'],
          minStickerCount: 5,
          searchBy: 'ALL',
          stickerType: 'ALL',
        },
      },
      {
        headers: {
          'user-agent': 'androidapp.stickerly/3.17.0',
          'content-type': 'application/json',
        },
      }
    )

    const packs = data?.result?.stickerPacks || []
    if (!packs.length) return m.reply('Tidak ada pack ditemukan.')

    global.stickerlySession[m.sender] = packs

    let teks = `*StickerLy Search: ${query}*\n\n`
    packs.slice(0, 10).forEach((p, i) => {
      teks += `*${i + 1}.* ${p.name}\n`
      teks += `Author : ${p.authorName}\n`
      teks += `Stickers: ${p.resourceFiles.length}\n`
      teks += `${p.shareUrl}\n\n`
    })
    teks += `Pilih dengan cara ketik:\n*${usedPrefix + command} nomor*\nContoh: *${usedPrefix + command} 1*`

    await m.reply(teks)
  } catch (e) {
    console.log(e)
    m.reply('Gagal mencari pack.')
  }
}

handler.help = [
  'stly <query/nomor>',
  'stickerly <query/nomor>'
]

handler.tags = ['sticker']
handler.command = /^(stly|stickerly)$/i
handler.limit = true

export default handler