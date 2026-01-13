// STICKER WIKI ( search pack sticker)
// type : Plugin ESM 
// Source : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
// source Scrape : https://whatsapp.com/channel/0029Vb2mOzL1Hsq0lIEHoR0N/572
import axios from 'axios'
import cheerio from 'cheerio'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Masukkan kata kunci untuk cari stiker!\n\nContoh:\n${usedPrefix + command} blue archive`

  let links = await searchByQuery(text)
  if (!links.length) throw '❌ Tidak ditemukan hasil stiker untuk kata kunci tersebut.'

  let res = await download(links[0])
  if (!res || !res.sticker.length) throw '❌ Tidak ditemukan file stiker yang dapat diunduh.'

  await m.reply(`📦 *${res.title}*\nMengirim 10 stiker...`)

  let packname = 'Elaina - MD'
  let author = 'By Hilman'

  for (let url of res.sticker.slice(0, 10)) {
    try {
      let imgBuffer = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(res => res.data)

      let stiker = await sticker(imgBuffer, false, packname, author)
      if (stiker) await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    } catch (e) {
      console.error('❌ Gagal stiker:', url)
    }
  }
}

handler.help = ['stikwiki <kata kunci>']
handler.tags = ['sticker']
handler.command = /^stikwiki$/i
handler.limit = true

export default handler

// === SCRAPER ===

async function searchByQuery(query) {
  const url = "https://stickers.wiki/_actions/searchTags/"
  try {
    const { data } = await axios.post(url, { query }, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        Origin: "https://stickers.wiki",
        Referer: "https://stickers.wiki/id/telegram/search/",
      },
    })

    if (!Array.isArray(data) || data.length < 3) return []

    const links = []
    const slugs = new Set()
    const indices = data[0]
    if (!Array.isArray(indices)) return []

    indices.forEach(idx => {
      if (idx < data.length) {
        const item = data[idx]
        if (typeof item === "object" && item !== null &&
          's' in item && 'n' in item && 'f' in item && 'c' in item && 'r' in item && 'l' in item) {
          const slugIndex = idx + 1
          if (slugIndex < data.length && typeof data[slugIndex] === "string") {
            const slug = data[slugIndex]
            if (/^[a-zA-Z][a-zA-Z0-9_\-]{2,}$/.test(slug)) {
              slugs.add(slug)
            }
          }
        }
      }
    })

    slugs.forEach(slug => {
      links.push(`https://stickers.wiki/id/telegram/${slug}/`)
    })

    return links
  } catch (err) {
    console.error("Search Error:", err.message)
    return []
  }
}

async function download(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const $ = cheerio.load(data)
    const title = $("h1.line-clamp-2.w-full.text-center.text-2xl.font-semibold").text().trim()
    const sticker = []

    $("div[onclick*='sticker-dialog'] script[type='application/ld+json']").each((_, el) => {
      try {
        const jsonData = JSON.parse($(el).html())
        if (jsonData.contentUrl && jsonData.contentUrl.endsWith('.webp')) {
          sticker.push(jsonData.contentUrl)
        }
      } catch {}
    })

    return { title, sticker }
  } catch (err) {
    console.error("Download Error:", err.message)
    return null
  }
}