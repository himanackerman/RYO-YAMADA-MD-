import axios from "axios"

async function blackhole(url) {
  const apiUrl = `https://main.api.progmore.com/?url=${encodeURIComponent(url)}`
  try {
    const res = await axios.get(apiUrl)
    return res.data
  } catch (err) {
    return { success: false, error_message: err.message }
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) throw `🍬 Masukkan link!\n\nContoh: .aio https://vt.tiktok.com/...`

  m.reply("✨ Sedang memproses link...")

  let result = await blackhole(text)
  if (!result.success || !result.download_links || result.download_links.length === 0) {
    throw `❌ Gagal fetch data!\n${result.error_message || "Tidak ada media ditemukan."}`
  }

  for (let url of result.download_links) {
    await conn.sendMessage(m.chat, {
      video: { url },
      caption: `✅ AIO Downloader\n🍭 Source: ${text}`
    }, { quoted: m })
  }
}

handler.help = ['aio <url>']
handler.tags = ['downloader']
handler.command = /^aio$/i
handler.limit = true

export default handler