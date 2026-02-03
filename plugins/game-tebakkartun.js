import axios from "axios"

async function scrapeKartun() {
  try {
    let src = [
      { name: "Tom and Jerry", img: "https://i.pinimg.com/736x/c2/f0/97/c2f0975cc0cb2985e359abce2461e986.jpg" },
      { name: "Mickey Mouse", img: "https://i.pinimg.com/736x/9e/bc/77/9ebc77ae4c7dca6ec3f342958d7b2cae.jpg" },
      { name: "Donald Duck", img: "https://i.pinimg.com/736x/6e/a7/d4/6ea7d415f9b6abe951fb1b43dc1e094f.jpg" },
      { name: "Scooby Doo", img: "https://i.pinimg.com/736x/68/76/fb/6876fb80983d8a780977c351fe65c54c.jpg" },
      { name: "The Flintstones", img: "https://i.pinimg.com/736x/3d/24/16/3d2416dbde61723402736548b72bd99b.jpg" },
      { name: "Popeye", img: "https://i.pinimg.com/736x/dc/48/a3/dc48a378fb3a86b744a0229d9ba36127.jpg" },
      { name: "SpongeBob SquarePants", img: "https://i.pinimg.com/736x/d2/b2/49/d2b2493f88da017b20b2f5ae1ad6be86.jpg" },
      { name: "Dora the Explorer", img: "https://i.pinimg.com/736x/35/a0/02/35a0020ad541c8d1d6428e119b523560.jpg" },
      { name: "Ben 10", img: "https://i.pinimg.com/736x/8a/f4/52/8af45205d34223f47b51f14edffce4e5.jpg" },
      { name: "Teenage Mutant Ninja Turtles", img: "https://i.pinimg.com/736x/59/72/c4/5972c4fd49d8343cb0d27201d5d861c0.jpg" },
      { name: "The Pink Panther", img: "https://i.pinimg.com/736x/4c/35/a1/4c35a178ac9b02dd3f5c64142ec8cb54.jpg" },
      { name: "Bugs Bunny", img: "https://i.pinimg.com/736x/8e/4c/16/8e4c16d699ca1b53ef3b8e935a9e1034.jpg" },
      // ... (biarkan sisanya tetap sama seperti list kamu tadi)
    ]

    return src[Math.floor(Math.random() * src.length)]

  } catch {
    throw new Error("Gagal fetch data kartun!")
  }
}

let timeout = 60000

let handler = async (m, { conn, command }) => {
  global.tebakkartun = global.tebakkartun || {}
  const chat = m.chat

  if (!global.tebakkartun[chat]) global.tebakkartun[chat] = {}
  let room = global.tebakkartun[chat]

  switch (command) {

    case "tebakkartun": {
      const data = await scrapeKartun()
      const answer = data.name.toLowerCase()

      await conn.sendMessage(
        chat,
        {
          image: { url: data.img },
          caption: `🎨 *TEBAK KARTUN*\n\nApa nama kartun ini?\n⏳ Timeout: ${timeout / 1000} detik\nKetik *whokartun* untuk klu.\nJawab langsung.`
        },
        { quoted: m }
      )

      global.tebakkartun[chat] = {
        answer,
        player: m.sender,
        timer: setTimeout(() => {
          conn.reply(chat, `❌ Waktu habis!\nJawaban: *${answer}*`)
          delete global.tebakkartun[chat]
        }, timeout)
      }
      break
    }

    case "whokartun": {
      if (!room.answer) return conn.reply(chat, "❌ Tidak ada game aktif.", m)

      let ans = room.answer
      let hint = ans[0] + "_".repeat(Math.max(ans.length - 2, 1)) + ans.at(-1)

      return conn.reply(chat, `🧩 *KLU:* ${hint}`, m)
    }
  }
}

handler.all = async function (m) {
  global.tebakkartun = global.tebakkartun || {}

  const room = global.tebakkartun[m.chat]
  if (!room?.answer) return

  const text = (m.text || "").trim().toLowerCase()
  if (!text) return

  if (text === room.answer || text.includes(room.answer)) {
    clearTimeout(room.timer)

    this.reply(
      m.chat,
      `✅ Benar! 🎉\nJawaban: *${room.answer}*`,
      m
    )

    delete global.tebakkartun[m.chat]
  }
}

handler.help = ["tebakkartun"]
handler.tags = ["game"]
handler.command = /^(tebakkartun|whokartun)$/i
handler.limit = false

export default handler