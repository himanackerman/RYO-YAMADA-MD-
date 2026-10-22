import axios from "axios"
import * as cheerio from "cheerio"

async function mangaSearch(query) {
  const q = query.trim()
  if (!q) throw "Query kosong"

  const res = await axios.get(`https://myanimelist.net/manga.php?q=${encodeURIComponent(q)}&cat=manga`)
  const $ = cheerio.load(res.data)
  const results = []

  $("table tbody tr").each((i, el) => {
    const title = $(el).find("td:nth-child(2) strong").text().trim()
    const mangaUrl = $(el).find("td:nth-child(2) a").attr("href")
    const type = $(el).find("td:nth-child(3)").text().trim()
    const vol = $(el).find("td:nth-child(4)").text().trim()
    const score = $(el).find("td:nth-child(5)").text().trim()
    const description = $(el)
      .find("td:nth-child(2) .pt4")
      .text()
      .replace("read more.", "")
      .trim()

    if (title && mangaUrl) {
      results.push({
        title,
        url: mangaUrl,
        description: description || "No description",
        type,
        vol,
        score
      })
    }
  })

  return results
}

let handler = async (m, { text }) => {
  if (!text) throw `Contoh:\n.manga one piece`

  await m.react("📚")

  const data = await mangaSearch(text)
  if (!data.length) return m.reply("Manga tidak ditemukan")

  const manga = data[0]

  let teks = `📖 *${manga.title}*\n\n`
  teks += `⭐ Score : ${manga.score || "-"}\n`
  teks += `📚 Type : ${manga.type || "-"}\n`
  teks += `📦 Volume : ${manga.vol || "-"}\n\n`
  teks += `📝 ${manga.description}\n\n`
  teks += `🔗 ${manga.url}`

  m.reply(teks.trim())
}

handler.help = ['manga <judul>']
handler.tags = ['anime']
handler.command = /^manga$/i
handler.limit = true

export default handler