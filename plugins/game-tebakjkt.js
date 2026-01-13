import axios from "axios"

async function scrapeJKT() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/siputzx/tebak-jkt/main/tebak.json",
      { timeout: 30000 }
    )

    const list = res.data
    const pick = list[Math.floor(Math.random() * list.length)]

    if (!pick.gambar || !pick.jawaban) throw new Error("Invalid data JKT")

    return {
      img: pick.gambar,
      answer: pick.jawaban.toLowerCase()
    }

  } catch {
    throw new Error("Gagal mengambil data JKT!")
  }
}

let timeout = 60000

let handler = async (m, { conn, command }) => {
  global.tebakjkt = global.tebakjkt || {}
  const chat = m.chat

  if (!global.tebakjkt[chat]) global.tebakjkt[chat] = {}
  let room = global.tebakjkt[chat]

  switch (command) {
    
    // ===== START GAME =====
    case "tebakjkt": {
      const data = await scrapeJKT()

      await conn.sendMessage(
        chat,
        {
          image: { url: data.img },
          caption: `🎀 *TEBAK MEMBER JKT48*\n\nSiapakah member pada gambar ini?\n⏳ Timeout: ${timeout / 1000} detik\nKetik *whojkt* untuk klu.\nJawab langsung.`
        },
        { quoted: m }
      )

      global.tebakjkt[chat] = {
        answer: data.answer,
        player: m.sender,
        timer: setTimeout(() => {
          conn.reply(chat, `❌ Waktu habis!\nJawaban: *${data.answer}*`)
          delete global.tebakjkt[chat]
        }, timeout)
      }

      break
    }

    // ===== KLU =====
    case "whojkt": {
      if (!room.answer) return conn.reply(chat, "❌ Tidak ada game aktif.", m)

      const ans = room.answer
      const hint =
        ans[0] +
        "_".repeat(Math.max(ans.length - 2, 1)) +
        ans[ans.length - 1]

      return conn.reply(chat, `🧩 *KLU:* ${hint}`, m)
    }
  }
}

// ===== AUTO JAWAB =====
handler.all = async function (m) {
  global.tebakjkt = global.tebakjkt || {}

  const room = global.tebakjkt[m.chat]
  if (!room?.answer) return

  const text = (m.text || "").trim().toLowerCase()
  if (!text) return

  if (text === room.answer || text.includes(room.answer)) {
    clearTimeout(room.timer)

    this.reply(
      m.chat,
      `✅ *Benar!* 🎉\nJawaban: *${room.answer}*`,
      m
    )

    delete global.tebakjkt[m.chat]
  }
}

handler.help = ["tebakjkt"]
handler.tags = ["game"]
handler.command = /^(tebakjkt|whojkt)$/i
handler.limit = false

export default handler