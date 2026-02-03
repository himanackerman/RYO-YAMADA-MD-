import axios from "axios"

async function scrapeGame() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/qisyana/scrape/main/tebakgame.json",
      { timeout: 30000 }
    )
    const data = res.data
    const pick = data[Math.floor(Math.random() * data.length)]
    if (!pick.img || !pick.jawaban) throw new Error("Invalid data")

    return {
      img: pick.img,
      answer: pick.jawaban.toLowerCase()
    }
  } catch {
    throw new Error("Gagal mengambil data game!")
  }
}

let timeout = 60000

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
  global.tebakgame = global.tebakgame || {}
  const chat = m.chat

  if (!global.tebakgame[chat]) global.tebakgame[chat] = {}
  let room = global.tebakgame[chat]

  switch (command) {

    case "tebakgame": {
      const data = await scrapeGame()

      await conn.sendFile(
        chat,
        data.img,
        "game.jpg",
        `🎮 *TEBAK GAME*\n\nLihat gambar di atas.\n⏳ Waktu: *60 detik*.\nJawab nama gamenya.`,
        m
      )

      global.tebakgame[chat] = {
        answer: data.answer,
        player: m.sender,
        timer: setTimeout(() => {
          conn.reply(chat, `❌ Waktu habis!\nJawaban: *${data.answer}*`)
          delete global.tebakgame[chat]
        }, timeout)
      }

      break
    }

    case "whogame": {
      if (!room.answer) return conn.reply(chat, "❌ Tidak ada game aktif.", m)
      if (!isAdmin && !isOwner) return conn.reply(chat, "❌ Tidak diizinkan.", m)

      const ans = room.answer
      const hint = ans[0] + "_".repeat(Math.max(ans.length - 2, 1)) + ans.at(-1)

      return conn.reply(chat, `🧩 *KLU:* ${hint}`, m)
    }
  }
}

handler.all = async function (m) {
  global.tebakgame = global.tebakgame || {}
  const room = global.tebakgame[m.chat]
  if (!room?.answer) return

  const text = (m.text || "").trim().toLowerCase()
  if (!text) return

  if (
    text === room.answer ||
    text.includes(room.answer)
  ) {
    clearTimeout(room.timer)

    this.reply(
      m.chat,
      `✅ Benar! 🎉\nJawaban: *${room.answer}*`,
      m
    )

    delete global.tebakgame[m.chat]
  }
}

handler.help = ["tebakgame"]
handler.tags = ["game"]
handler.command = /^(tebakgame|whogame)$/i
handler.limit = false

export default handler