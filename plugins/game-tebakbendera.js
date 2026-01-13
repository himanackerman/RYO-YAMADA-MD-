import axios from "axios"

async function scrapeFlag() {
  try {
    const res = await axios.get("https://flagcdn.com/en/codes.json", { timeout: 30000 })
    const data = res.data
    const keys = Object.keys(data)
    const code = keys[Math.floor(Math.random() * keys.length)]
    return {
      name: data[code].toLowerCase(),
      img: `https://flagcdn.com/w640/${code}.png`,
    }
  } catch {
    const fb = await axios.get(
      "https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakbendera2.json",
      { timeout: 30000 }
    )
    const d = fb.data[Math.floor(Math.random() * fb.data.length)]
    return {
      name: (d.name || d.country).toLowerCase(),
      img: d.img || d.flag,
    }
  }
}

let timeout = 60000

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
  global.tebakbendera = global.tebakbendera || {}
  const chat = m.chat
  const room = global.tebakbendera[chat] || {}

  if (command === "tebakbendera" || command === "tbendera") {
    if (room.answer)
      return conn.reply(chat, "Masih ada soal belum terjawab di chat ini.", m)

    const data = await scrapeFlag()

    await conn.sendMessage(
      chat,
      {
        image: { url: data.img },
        caption:
          "🗺️ *TEBAK BENDERA*\n\nIni bendera negara apa?\n⏳ Waktu: *60 detik*\nKetik jawaban langsung.\nKetik *.whoflag* untuk klu.",
      },
      { quoted: m }
    )

    global.tebakbendera[chat] = {
      answer: data.name,
      player: m.sender,
      timer: setTimeout(() => {
        conn.reply(chat, `❌ Waktu habis!\nJawaban: *${data.name}*`)
        delete global.tebakbendera[chat]
      }, timeout),
    }
  }

  if (command === "whoflag") {
    if (!room.answer) return conn.reply(chat, "❌ Tidak ada game aktif.", m)
    if (!isAdmin && !isOwner)
      return conn.reply(chat, "❌ Klu hanya untuk admin/owner.", m)

    const ans = room.answer
    const hint = ans[0] + "_".repeat(Math.max(ans.length - 2, 1)) + ans.slice(-1)
    return conn.reply(chat, `🧩 *KLU:* ${hint}`, m)
  }

  if (command === "who") {
    if (!room.player) return conn.reply(chat, "❌ Tidak ada game aktif.", m)
    return conn.reply(
      chat,
      `👤 Player: @${room.player.split("@")[0]}`,
      m,
      { mentions: [room.player] }
    )
  }
}

handler.all = async function (m) {
  const room = global.tebakbendera?.[m.chat]
  if (!room?.answer) return

  const text = (m.text || "").trim().toLowerCase()
  if (!text) return

  if (text === room.answer) {
    clearTimeout(room.timer)
    this.reply(m.chat, `✅ *Benar!* 🎉\nJawaban: *${room.answer}*`, m)
    delete global.tebakbendera[m.chat]
  }
}

handler.help = ["tebakbendera"]
handler.tags = ["game"]
handler.command = /^(tebakbendera|tbendera|whoflag|who)$/i
handler.limit = false

export default handler