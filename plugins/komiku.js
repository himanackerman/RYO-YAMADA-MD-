import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} solo leveling`)

  try {
    const searchUrl = `https://komiku.org/?post_type=manga&s=${encodeURIComponent(text)}`
    const { data: searchPageHtml } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    const $searchPage = cheerio.load(searchPageHtml)
    const apiUrl = $searchPage("span[hx-get]").attr("hx-get")

    if (!apiUrl) return m.reply('❌ Gagal mendapatkan data. Mungkin website berubah.')

    const { data: apiData } = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    const $ = cheerio.load(apiData)
    const results = []

    $("div.bge").each((_, el) => {
      const title = $(el).find("h3").text().trim()
      const link = $(el).find("div.bgei > a").attr("href")
      const image = $(el).find("div.bgei > a > img").attr("src")
      if (title && link && image) {
        results.push({ title, link, image })
      }
    })

    if (!results.length) return m.reply('❌ Tidak ditemukan hasil untuk manga tersebut.')

    let teks = `🔎 Hasil pencarian untuk: *${text}*\n\n`
    for (let i = 0; i < Math.min(5, results.length); i++) {
      teks += `📖 *${results[i].title}*\n🌐 ${results[i].link}\n🖼️ ${results[i].image}\n\n`
    }

    await conn.sendMessage(m.chat, {
      image: { url: results[0].image },
      caption: teks.trim()
    }, { quoted: m })

  } catch (e) {
    m.reply('❌ Terjadi error saat scraping.\n' + e.message)
  }
}

handler.help = ['komiku <query>']
handler.tags = ['anime', 'search']
handler.command = /^komiku$/i
handler.limit = true

export default handler