/**
  ⊱ ───〔✨ NCS Player 〕─── ⊰
  │ Author : Hilman 🍁
  │ Type: Plugins ESM 
  │ Desc: Mainkan & cari lagu dari NCS.io (random, search, play)
  ⊱ ──────────────────────────────── ⊰

  🍡 Command List:
     ✦ .playncs [judul]   → Cari & kirim lagu langsung (atau random jika kosong)
     ✦ .ncssearch [judul] → Tampilkan daftar hasil pencarian
     ✦ .ncsplay [nomor]   → Putar lagu dari hasil pencarian sebelumnya

  🍡 Source Scrape : https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/411
*/

import axios from "axios"
import * as cheerio from "cheerio"

class NCS {
  constructor() {
    this.baseUrl = "https://ncs.io"
  }

  async searchTracks(query = "") {
    try {
      const url = `${this.baseUrl}/music-search${query ? `?q=${encodeURIComponent(query)}` : ""}`
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0 Safari/537.36"
        }
      })
      const $ = cheerio.load(data)
      const tracks = []

      $("table.tablesorter tbody tr").each((_, el) => {
        const $row = $(el)
        const $play = $row.find(".player-play")

        const tid = $play.attr("data-tid") || ""
        const title = $play.attr("data-track") || ""
        const artist = $play.attr("data-artistraw") || ""
        const image = $row.find("td img[alt]").attr("src") || ""
        const releaseDate = $row.find("td:nth-child(6)").text().trim()

        if (tid && title) {
          tracks.push({ tid, title, artist, image, releaseDate })
        }
      })
      return tracks
    } catch (err) {
      console.error("Error searching NCS:", err.message)
      return []
    }
  }

  async getDownloadInfo(tid) {
    try {
      const { data } = await axios.get(`${this.baseUrl}/track/info/${tid}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": `${this.baseUrl}/music-search`
        }
      })
      const $ = cheerio.load(data)
      const info = {
        tid,
        title: "",
        artist: "",
        downloadUrl: "",
        imageUrl: "",
        copyText: ""
      }

      const $h5 = $("h5")
      if ($h5.length) {
        info.title = $h5.contents().first().text().trim()
        info.artist = $h5.find("span").text().trim()
      }

      const $btn = $("a.btn.black[href*='/track/download/']")
      if ($btn.length) info.downloadUrl = `${this.baseUrl}${$btn.attr("href")}`

      const style = $(".cover .img").attr("style") || ""
      const match = style.match(/url\\('([^']+)'\\)/)
      if (match) info.imageUrl = match[1]

      info.copyText = $("#panel-copy").text().trim()
      return info
    } catch (err) {
      console.error(`Error fetching download info:`, err.message)
      return null
    }
  }
}

let handler = async (m, { conn, text, command }) => {
  const ncs = new NCS()
  conn.ncsResults = conn.ncsResults || {}

  if (command === "playncs") {
    let tracks = []
    if (text) {
      await m.reply("🍭 Mencari lagu NCS...")
      tracks = await ncs.searchTracks(text)
      if (!tracks.length) return m.reply("🍬 Tidak ada hasil ditemukan di NCS.io.")
    } else {
      await m.reply("🍭 Mengambil lagu acak...")
      tracks = await ncs.searchTracks("")
      if (!tracks.length) return m.reply("🍬 Tidak bisa mengambil daftar lagu NCS.")
      tracks = [tracks[Math.floor(Math.random() * tracks.length)]]
    }

    const first = tracks[0]
    const info = await ncs.getDownloadInfo(first.tid)
    if (!info || !info.downloadUrl) return m.reply("🚫 Gagal mengambil link download lagu.")

    const caption = `🎧 *NCS Music*\n\n` +
      `✨ Judul: ${first.title}\n` +
      `🍢 Artis: ${first.artist}\n` +
      `🥧 Rilis: ${first.releaseDate}\n` +
      `🍭 Link: ${info.downloadUrl}\n\n` +
      `💿 Source: ncs.io`

    try {
      await conn.sendFile(m.chat, info.imageUrl || first.image, "ncs.jpg", caption, m)
      await conn.sendMessage(m.chat, {
        audio: { url: info.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${first.title} - ${first.artist}.mp3`,
        ptt: false
      }, { quoted: m })
    } catch (e) {
      console.error(e)
      m.reply("🍬 Gagal mengirim file audio.\nLink manual:\n" + info.downloadUrl)
    }
  }

  if (command === "ncssearch") {
    if (!text) return m.reply("❀ Contoh: *.ncssearch Invincible*")

    await m.reply("🍭 Sedang mencari lagu di NCS.io...")
    const results = await ncs.searchTracks(text)
    if (!results.length) return m.reply("🍬 Tidak ada hasil ditemukan.")

    let list = `🎶 *Hasil pencarian NCS untuk:* ${text}\n\n`
    results.slice(0, 10).forEach((v, i) => {
      list += `*${i + 1}.* ${v.title} - ${v.artist}\n📅 ${v.releaseDate}\n\n`
    })
    list += `Ketik *.ncsplay [nomor]* untuk memutar lagu dari hasil pencarian.\nContoh: *.ncsplay 1*`

    conn.ncsResults[m.sender] = results
    await m.reply(list)
  }

  if (command === "ncsplay") {
    const num = parseInt(text)
    if (isNaN(num)) return m.reply("🍬 Ketik nomor hasil pencarian, contoh: *.ncsplay 1*")

    const results = conn.ncsResults[m.sender]
    if (!results) return m.reply("🍬 Kamu belum melakukan pencarian. Gunakan *.ncssearch [judul]* dulu.")

    const track = results[num - 1]
    if (!track) return m.reply("⚠️ Nomor tidak valid.")

    await m.reply("🍭 Mengambil lagu...")
    const info = await ncs.getDownloadInfo(track.tid)
    if (!info || !info.downloadUrl) return m.reply("🍬 Gagal mengambil link download lagu.")

    const caption = `🎧 *NCS Music*\n\n` +
      `✨ Judul: ${track.title}\n` +
      `🍭 Artis: ${track.artist}\n` +
      `🍢 Rilis: ${track.releaseDate}\n` +
      `🥧 Link: ${info.downloadUrl}\n\n` +
      `💿 Source: ncs.io`

    try {
      await conn.sendFile(m.chat, info.imageUrl || track.image, "ncs.jpg", caption, m)
      await conn.sendMessage(m.chat, {
        audio: { url: info.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${track.title} - ${track.artist}.mp3`,
        ptt: false
      }, { quoted: m })
    } catch (e) {
      console.error(e)
      m.reply("🍬 Gagal mengirim file audio.\nLink manual: " + info.downloadUrl)
    }
  }
}

handler.help = ["playncs", "ncssearch", "ncsplay"]
handler.tags = ["sound"]
handler.command = /^(playncs|ncssearch|ncsplay)$/i
handler.limit = true
handler.register = true

export default handler