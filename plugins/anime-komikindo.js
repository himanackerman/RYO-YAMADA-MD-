import axios from "axios"
import * as cheerio from "cheerio"

/* =========================
   SCRAPER (ASLI, DISATUKAN)
========================= */

async function searchKomik(query) {
  const { data: html } = await axios.get("https://komikindo.ch", {
    params: { s: query }
  })

  const $ = cheerio.load(html)
  let result = []

  $(".animposx").each((_, el) => {
    const title = $(el).find("h3").text().trim()
    const imageUrl = $(el).find("img").attr("src")
    const rating = $(el).find(".rating").text().trim()
    const linkKomik = $(el).find(".tt > h3 > a").attr("href")

    if (title && linkKomik) {
      result.push({
        title,
        imageUrl,
        rating,
        linkKomik
      })
    }
  })

  return result
}

async function getDetail(url) {
  const { data: html } = await axios.get(url)
  const $ = cheerio.load(html)

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim()

  const imageUrl = $(".thumb img").attr("src")
  const rating = $(".rating").text().trim().match(/\d+/)?.[0] || "N/A"

  let detail = []
  $(".spe span").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim()
    const parts = text.split(":")
    if (parts.length >= 2) {
      detail.push(parts.slice(1).join(":").trim())
    }
  })

  return {
    title,
    imageUrl,
    rating,
    link: url,
    judulAlternatif: detail[0] || "-",
    status: detail[1] || "-",
    pengarang: detail[2] || "-",
    ilustrator: detail[3] || "-",
    grafis: detail[4] || "-",
    tema: detail[5] || "-",
    jenisKomik: detail[6] || "-",
    official: detail[7] || "-",
    informasi: detail[8] || "-"
  }
}

/* =========================
   HANDLER
========================= */

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
`📚 *KomikIndo*
Gunakan:
${usedPrefix + command} <judul>
${usedPrefix + command} detail <link>

Contoh:
${usedPrefix + command} return of top class master`
    )
  }

  /* ===== DETAIL MODE ===== */
  if (text.startsWith("detail ")) {
    const url = text.replace("detail ", "").trim()
    if (!url.startsWith("http"))
      return m.reply("❌ Link tidak valid")

    await m.reply("🔍 Mengambil detail komik...")

    try {
      const d = await getDetail(url)

      return conn.sendMessage(
        m.chat,
        {
          image: { url: d.imageUrl },
          caption:
`📖 *${d.title}*
⭐ Rating: ${d.rating}

• Judul Alt : ${d.judulAlternatif}
• Status    : ${d.status}
• Author : ${d.pengarang}
• Ilustrator: ${d.ilustrator}
• Art    : ${d.grafis}
• Genre      : ${d.tema}
• Type     : ${d.jenisKomik}
• Official  : ${d.official}

🔗 ${d.link}`
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      return m.reply("❌ Gagal mengambil detail komik")
    }
  }

  /* ===== SEARCH MODE ===== */
  await m.reply("🔎 Mencari komik...")

  try {
    const res = await searchKomik(text)
    if (!res.length) return m.reply("❌ Komik tidak ditemukan")

    let list = `📚 *Hasil Pencarian KomikIndo*\n\n`
    res.slice(0, 10).forEach((v, i) => {
      list +=
`${i + 1}. *${v.title}*
⭐ ${v.rating || "-"}
🔗 ${v.linkKomik}\n\n`
    })

    list += `Ketik:\n${usedPrefix + command} detail <link>`

    return m.reply(list)
  } catch (e) {
    console.error(e)
    m.reply("❌ Error saat mencari komik")
  }
}

handler.help = ["komikindo <judul>", "komikindo detail <link>"]
handler.tags = ["anime"]
handler.command = /^komikindo$/i

export default handler