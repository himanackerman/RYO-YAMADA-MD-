import axios from "axios"

async function scrapeWarna() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/siputzx/databasee/main/games/butawarna.json",
      { timeout: 30000 }
    )

    const list = res.data.filter(v =>
      v.correct && v.image && v.image.startsWith("http")
    )

    if (!list.length) throw new Error("Database warna tidak valid")

    const pick = list[Math.floor(Math.random() * list.length)]

    return {
      img: pick.image,
      answer: String(pick.correct).toLowerCase()
    }
  } catch {
    throw new Error("Gagal mengambil data warna!")
  }
}

let timeout = 60000 // 60 detik

let handler = async (m, { conn, command }) => {
  global.tebakwarna = global.tebakwarna || {}
  const chat = m.chat
  let room = global.tebakwarna[chat]

  switch (command) {
    case "tebakwarna": {
      if (room?.active)
        return m.reply("❌ Masih ada soal yang belum terjawab!", m)

      let data
      try {
        data = await scrapeWarna()
      } catch {
        return m.reply("❌ Gagal mengambil data warna!", m)
      }

      await conn.sendFile(
        chat,
        data.img,
        "warna.jpg",
        `🎨 *TES BUTA WARNA (Ishihara)*\n\nKamu melihat angka berapa pada gambar ini?\n⏳ Timeout: *${timeout / 1000} detik*\nJawab langsung.`,
        m
      )

      global.tebakwarna[chat] = {
        active: true,
        answer: data.answer,
        player: m.sender,
        timer: setTimeout(() => {
          conn.reply(chat, `❌ Waktu habis!\nJawaban: *${data.answer}*`)
          delete global.tebakwarna[chat]
        }, timeout)
      }
      break
    }

    case "whowarna": {
      if (!room?.active) return m.reply("❌ Tidak ada game aktif.", m)

      let ans = room.answer
      let hint =
        ans[0] +
        "_".repeat(Math.max(ans.length - 2, 1)) +
        ans[ans.length - 1]

      return m.reply(`🧩 *KLU:* ${hint}`, m)
    }
  }
}

handler.all = async function (m) {
  global.tebakwarna = global.tebakwarna || {}
  const room = global.tebakwarna[m.chat]
  if (!room?.active) return

  let text = (m.text || "").trim().toLowerCase()
  if (!text) return

  if (text === room.answer) {
    clearTimeout(room.timer)

    this.reply(
      m.chat,
      `✅ Benar! 🎉\nJawaban yang benar adalah *${room.answer}*`,
      m
    )

    delete global.tebakwarna[m.chat]
  }
}

handler.help = ["tebakwarna"] 
handler.tags = ["game"]
handler.command = /^(tebakwarna|whowarna)$/i
handler.limit = false
handler.game = true

export default handler