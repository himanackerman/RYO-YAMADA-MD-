// plugins/pixivsearch.js
// Pixiv Search
// API : https://anabot.my.id
// Author : Hilman

import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} Elaina`

  await m.reply('✨cihuy otw')

  try {
    let api = `https://anabot.my.id/api/search/pixiv?query=${encodeURIComponent(text)}&apikey=freeApikey`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.success || !json.data?.result?.length) {
      throw `⚠️ Tidak ada hasil ditemukan untuk *${text}*`
    }

    let hasil = json.data.result
    let top = hasil.slice(0, 5) // ambil 5 gambar teratas

    for (let i = 0; i < top.length; i++) {
      let v = top[i]
      let teks = `🎨 *Pixiv Result #${i + 1}*\n\n`
      teks += `*Judul:* ${v.title}\n`
      teks += `📝 ${v.alt}\n`
      teks += `🏷️ Tags: ${v.tags.join(", ")}\n`
      teks += `🔗 Source: Pixiv (via anabot.my.id)\n`

      await conn.sendFile(m.chat, v.urlImage, "pixiv.jpg", teks, m)

      // delay 2 detik sebelum kirim gambar berikutnya
      if (i < top.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

  } catch (e) {
    console.error(e)
    throw `⚠️ Terjadi kesalahan, coba lagi nanti.`
  }
}

handler.help = ['pixiv <query>']
handler.tags = ['internet']
handler.command = /^pixiv$/i
handler.limit = true

export default handler