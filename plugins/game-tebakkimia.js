import axios from "axios"

async function scrapeKimia() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakkimia.json",
      { timeout: 30000 }
    )

    const list = res.data.filter(v => v.unsur && v.lambang)
    if (!list.length) throw new Error("Database kimia rusak")

    return list[Math.floor(Math.random() * list.length)]
  } catch {
    throw new Error("Gagal fetch data kimia!")
  }
}

let timeout = 60000

let handler = async (m, { conn, command }) => {
  global.tebakkimia = global.tebakkimia || {}
  const chat = m.chat
  let room = global.tebakkimia[chat]

  switch (command) {
    case "tebakkimia": {
      if (room?.active) return m.reply("Masih ada soal yang belum dijawab!", m)

      let data
      try {
        data = await scrapeKimia()
      } catch {
        return m.reply("Gagal mengambil data kimia!", m)
      }

      const soal = data.lambang
      const answer = data.unsur.toLowerCase()

      await conn.reply(
        chat,
        `🧪 TEBAK UNSUR KIMIA\n\nApa nama unsur dari lambang berikut?\n\n🔤 ${soal}\n\n⏳ Timeout: ${timeout / 1000} detik\nKetik .whokimia untuk hint.\nJawab langsung.`,
        m
      )

      global.tebakkimia[chat] = {
        active: true,
        answer,
        timer: setTimeout(() => {
          conn.reply(chat, `Waktu habis!\nJawaban: ${answer}`)
          delete global.tebakkimia[chat]
        }, timeout)
      }
      break
    }

    case "whokimia": {
      if (!room?.active) return m.reply("Tidak ada game aktif.", m)

      const ans = room.answer
      const hint = ans[0] + "_".repeat(Math.max(ans.length - 2, 1)) + ans.slice(-1)

      return m.reply(`KLU: ${hint}`, m)
    }
  }
}

handler.all = async function (m) {
  global.tebakkimia = global.tebakkimia || {}
  const room = global.tebakkimia[m.chat]
  if (!room?.active) return

  const text = (m.text || "").trim().toLowerCase()
  if (!text) return

  if (text === room.answer) {
    clearTimeout(room.timer)
    this.reply(m.chat, `Benar!\nJawaban: ${room.answer}`, m)
    delete global.tebakkimia[m.chat]
  }
}

handler.help = ["tebakkimia"]
handler.tags = ["game"]
handler.command = /^(tebakkimia|whokimia)$/i
handler.limit = false
handler.game = true

export default handler