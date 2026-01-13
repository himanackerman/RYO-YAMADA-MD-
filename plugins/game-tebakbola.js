import axios from "axios"

let timeout = 60000
let poin = 4999

let handler = async (m, { conn, usedPrefix, command }) => {
  conn.game = conn.game || {}
  const id = "tebakbola-" + m.chat

  if (command === "tebakbola") {
    if (id in conn.game)
      return m.reply("Masih ada soal yang belum terjawab!")

    let data
    try {
      const res = await axios.get("https://api.deline.web.id/game/tebakpemainbola")
      if (!res.data?.result) throw new Error()
      data = res.data.result
    } catch {
      return m.reply("Gagal mengambil data pemain bola, coba lagi.")
    }

    const answer = data.jawaban.trim().toLowerCase()
    const clue = data.deskripsi || "Tidak ada deskripsi."

    const caption = `
⚽ *TEBAK PEMAIN BOLA*

Soal:
❓ *${data.soal}*

Timeout: *${timeout / 1000} detik*
Ketik *${usedPrefix}whobola* untuk bantuan
Bonus: ${poin} XP
`.trim()

    let msg = await m.reply(caption)

    conn.game[id] = [
      msg,
      { answer },
      poin,
      setTimeout(() => {
        if (conn.game[id]) {
          conn.reply(
            m.chat,
            `⏳ *Waktu habis!*\nJawabannya adalah: *${data.jawaban}*`,
            conn.game[id][0]
          )
          delete conn.game[id]
        }
      }, timeout)
    ]
  }

  if (command === "whobola") {
    if (!(id in conn.game)) return m.reply("Tidak ada game aktif.")

    let ans = conn.game[id][1].answer
    let hint = ans[0] + "_".repeat(Math.max(ans.length - 2, 1)) + ans.slice(-1)

    return m.reply(`🧩 *Hint:* ${hint}`)
  }
}

handler.all = async function (m) {
  const id = "tebakbola-" + m.chat
  if (!(id in this.game)) return

  let text = (m.text || "").trim().toLowerCase()
  if (!text) return

  let ans = this.game[id][1].answer

  if (text === ans || text.includes(ans)) {
    clearTimeout(this.game[id][3])
    this.reply(
      m.chat,
      `🎉 *Benar!* Pemain tersebut adalah: *${ans.toUpperCase()}*`,
      this.game[id][0]
    )
    delete this.game[id]
  }
}

handler.help = ["tebakbola"]
handler.tags = ["game"]
handler.command = /^(tebakbola|whobola)$/i
handler.limit = false
handler.game = true

export default handler