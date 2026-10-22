import axios from "axios"
import * as cheerio from "cheerio"

async function topAnime() {
  const url = "https://myanimelist.net/topanime.php"
  const res = await axios.get(url)
  const $ = cheerio.load(res.data)
  const results = []

  $(".ranking-list").each((i, el) => {
    const rank = $(el).find(".rank").text().trim()
    const title = $(el).find(".title h3 a").text().trim()
    const animeUrl = $(el).find(".title h3 a").attr("href")
    const score = $(el).find(".score span").text().trim()
    const info = $(el).find(".information").text().split("\n")

    const type = info[1]?.trim()
    const release = info[2]?.trim()
    const members = info[3]?.trim()

    if (title && animeUrl) {
      results.push({
        rank,
        title,
        score,
        url: animeUrl,
        type,
        release,
        members
      })
    }
  })

  return results
}

let handler = async (m, { text }) => {
  await m.react("🏆")

  const data = await topAnime()
  if (!data.length) return m.reply("Gagal mengambil data")

  let jumlah = parseInt(text)
  if (!jumlah || jumlah < 1) jumlah = 10
  if (jumlah > 50) jumlah = 50

  const list = data.slice(0, jumlah)

  let teks = `🏆 *TOP ANIME MYANIMELIST*\n`
  teks += `Menampilkan ${list.length} anime terbaik\n\n`

  for (let anime of list) {
    teks += `🎖 Rank ${anime.rank}\n`
    teks += `📺 ${anime.title}\n`
    teks += `⭐ ${anime.score}\n`
    teks += `📦 ${anime.type || "-"}\n`
    teks += `📅 ${anime.release || "-"}\n`
    teks += `👥 ${anime.members || "-"}\n`
    teks += `🔗 ${anime.url}\n\n`
  }

  m.reply(teks.trim())
}

handler.help = ['topanime <jumlah>']
handler.tags = ['anime']
handler.command = /^topanime$/i
handler.limit = true

export default handler