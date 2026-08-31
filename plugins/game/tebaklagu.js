import axios from "axios"

async function scrapeLagu() {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/qisyana/scrape/main/tebaklagu.json",
      { timeout: 30000 }
    )

    const list = res.data.filter(v =>
      v.lagu && v.lagu.startsWith("http") && v.judul && v.artis
    )

    if (!list.length) throw new Error("Database lagu tidak valid")

    const pick = list[Math.floor(Math.random() * list.length)]

    return {
      audio: pick.lagu,
      judul: pick.judul.toLowerCase(),
      artis: pick.artis.toLowerCase()
    }
  } catch (e) {
    throw new Error("Gagal mengambil data lagu!")
  }
}

let timeout = 60000

let handler = async (m, { conn, command }) => {
  global.tebaklagu = global.tebaklagu || {}
  const chat = m.chat
  let room = global.tebaklagu[chat] || {}

  switch (command) {
    case "tebaklagu": {
      if (room.active)
        return m.reply("❌ Masih ada soal yang belum terjawab!")

      let data
      try {
        data = await scrapeLagu()
      } catch {
        return m.reply("❌ Gagal mengambil data lagu, coba lagi.")
      }

      // kirim audio sebagai PTT
      await conn.sendMessage(
        chat,
        {
          audio: { url: data.audio },
          mimetype: "audio/mpeg",
          ptt: true
        },
        { quoted: m }
      )

      await m.reply(
        `🎵 *TEBAK LAGU*\n\nDengarkan audio.\n⏳ Timeout: *${timeout / 1000} detik*\nKetik *.wholagu* untuk hint.`
      )

      global.tebaklagu[chat] = {
        active: true,
        judul: data.judul,
        artis: data.artis,
        timer: setTimeout(() => {
          conn.reply(
            chat,
            `❌ Waktu habis!\nJawaban: *${data.judul}* - *${data.artis}*`
          )
          delete global.tebaklagu[chat]
        }, timeout)
      }

      break
    }

    case "wholagu": {
      if (!room.active) return m.reply("❌ Tidak ada game aktif.")

      const ans = room.judul
      const hint =
        ans[0] + "_".repeat(Math.max(ans.length - 2, 1)) + ans.slice(-1)

      return m.reply(`🧩 *Hint:* ${hint}`)
    }
  }
}

// CEK JAWABAN
handler.all = async function (m) {
  global.tebaklagu = global.tebaklagu || {}
  const room = global.tebaklagu[m.chat]
  if (!room?.active) return

  const text = (m.text || "").trim().toLowerCase()
  if (!text) return

  if (
    text === room.judul ||
    text === room.artis ||
    text.includes(room.judul) ||
    text.includes(room.artis)
  ) {
    clearTimeout(room.timer)

    this.reply(
      m.chat,
      `✅ *Benar!*\n\n🎵 Judul: *${room.judul}*\n🎤 Artis: *${room.artis}*`,
      m
    )

    delete global.tebaklagu[m.chat]
  }
}

handler.help = ["tebaklagu", "wholagu"]
handler.tags = ["game"]
handler.command = /^(tebaklagu|wholagu)$/i
handler.limit = false

export default handler