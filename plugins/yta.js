/**
 * YTMP3 & YTMP4 Downloader
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 source scrape : https://whatsapp.com/channel/0029Vb6xGdD11ulNhYPtMt3j/242
 
 */
 
import axios from "axios"
import yts from "yt-search"

async function ytdl(youtubeUrl, format = "mp3", quality = "128k") {
  try {
    const headers = {
      "Content-Type": "application/json",
      Origin: "https://ytmp3.gg",
      Referer: "https://ytmp3.gg/",
      "User-Agent": "Mozilla/5.0"
    }

    const isVideo = format === "mp4"

    const payload = {
      url: youtubeUrl,
      os: "windows",
      output: {
        type: isVideo ? "video" : "audio",
        format,
        ...(isVideo && { quality })
      },
      ...(!isVideo && { audio: { bitrate: quality } })
    }

    let downloadResponse
    try {
      downloadResponse = await axios.post(
        "https://hub.ytconvert.org/api/download",
        payload,
        { headers }
      )
    } catch {
      downloadResponse = await axios.post(
        "https://api.ytconvert.org/api/download",
        payload,
        { headers }
      )
    }

    const statusUrl = downloadResponse.data.statusUrl
    let finalData = null

    while (!finalData) {
      const statusCheck = await axios.get(statusUrl, { headers })

      if (
        statusCheck.data.status === "completed" ||
        statusCheck.data.status === "finished" ||
        statusCheck.data.downloadUrl
      ) {
        finalData = statusCheck.data
      } else if (statusCheck.data.status === "failed") {
        throw new Error("Conversion failed")
      } else {
        await new Promise(r => setTimeout(r, 2000))
      }
    }

    return {
      title: finalData.title || "YouTube Media",
      downloadUrl: finalData.downloadUrl
    }
  } catch (err) {
    console.log(err)
    return null
  }
}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) {
    return m.reply(`Contoh penggunaan:

${usedPrefix}ytmp3 https://youtu.be/xxxx
${usedPrefix}ytmp3 dj jedag jedug

${usedPrefix}ytmp4 https://youtu.be/xxxx
${usedPrefix}ytmp4 https://youtu.be/xxxx 480p`)
  }

  await m.react("🕒")

  let args = text.split(" ")
  let query = text
  let quality = null

  let format = command === "ytmp4" ? "mp4" : "mp3"

  if (args.length > 1 && args[args.length - 1].match(/k|p/i)) {
    quality = args.pop()
    query = args.join(" ")
  }

  if (!quality) {
    quality = format === "mp4" ? "480p" : "128k"
  }

  let url = query

  if (!/^https?:\/\//.test(query)) {
    let search = await yts(query)
    if (!search.all.length) {
      await m.react("❌")
      return m.reply("Video tidak ditemukan")
    }
    url = search.all[0].url
  }

  let res = await ytdl(url, format, quality)

  if (!res) {
    await m.react("❌")
    return m.reply("Gagal mengambil media")
  }

  if (format === "mp3") {
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: res.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: "ytmp3.mp3"
      },
      { quoted: m }
    )
  } else {
    await conn.sendMessage(
      m.chat,
      {
        video: { url: res.downloadUrl }
      },
      { quoted: m }
    )
  }

  await m.react("✅")
}

handler.help = ['ytmp3', 'ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp3|ytmp4)$/i
handler.limit = true

export default handler