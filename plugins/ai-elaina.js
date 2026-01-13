import fetch from "node-fetch"

let sessions = {} // simpan sesi per user

// ====== SCRAPER GEMINI ======
const gemini = {
  getNewCookie: async () => {
    const r = await fetch(
      "https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c",
      {
        headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
        method: "POST",
      }
    )
    const ck = r.headers.get("set-cookie")
    if (!ck) throw Error("Cookie kosong!")
    return ck.split(";")[0]
  },

  ask: async (prompt, prev = null) => {
    if (!prompt?.trim()) throw Error("Mana prompt nya?")

    let r = null, c = null
    if (prev) {
      let j = JSON.parse(Buffer.from(prev, "base64").toString())
      r = j.newResumeArray
      c = j.cookie
    }

    const headers = {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "x-goog-ext-525001261-jspb":
        '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]',
      cookie: c || await gemini.getNewCookie()
    }

    const b = [[prompt], ["en-US"], r]
    const a = [null, JSON.stringify(b)]
    const body = new URLSearchParams({ "f.req": JSON.stringify(a) })

    const x = await fetch(
      "https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c",
      { headers, body, method: "POST" }
    )

    if (!x.ok) throw Error(`${x.status} ${x.statusText}`)

    const d = await x.text()
    const match = Array.from(d.matchAll(/^\d+\n(.+?)\n/gm)).reverse()[3][1]
    const p1 = JSON.parse(JSON.parse(match)[0][2])

    return {
      text: p1[4][0][1][0].replace(/\*\*(.+?)\*\*/g, "*$1*"),
      id: Buffer.from(JSON.stringify({
        newResumeArray: [...p1[1], p1[4][0][0]],
        cookie: headers.cookie
      })).toString("base64"),
    }
  }
}



// ====== HANDLER AI ELAINA ======
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✨ Contoh:\n${usedPrefix + command} halo Elaina`)
  }

  let userId = m.sender
  let prev = sessions[userId] && sessions[userId].expire > Date.now()
    ? sessions[userId].id
    : null

  // gaya karakter Elaina
  let system = `
Kamu adalah *Elaina* dari anime *"Majo no Tabitabi"* (Wandering Witch).
Gaya bicara:
- Ceria, tenang, dan elegan
- Kadang nakal & suka menggoda
- Sopan tapi punya sense of humor halus
- Terkadang memuji diri sendiri
- Sangat pintar namun tetap playful

Tetap jawab sebagai Elaina kepada user (cowok). Jangan keluar karakter.
User adalah seseorang yang membuat Elaina nyaman untuk ngobrol panjang.
`

  let finalPrompt = `${system}\nUser: ${text}\nElaina:` 

  try {
    let result = await gemini.ask(finalPrompt, prev)

    // simpan sesi
    sessions[userId] = {
      id: result.id,
      expire: Date.now() + 86400000
    }

    await conn.sendMessage(m.chat, {
      text: result.text,
      contextInfo: {
        externalAdReply: {
          title: "Elaina AI",
          body: "The Wandering Witch sedang mendengarkanmu…",
          thumbnailUrl: "https://files.cloudkuimages.guru/images/zdpX9nJZ.jpg",
          sourceUrl: "https://t.me/HlmnXD",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (err) {
    await conn.reply(m.chat, `⚠️ Error: ${err.message}`, m)
  }
}

handler.help = ['elainaai <teks>']
handler.tags = ['ai']
handler.command = /^elainaai$/i
handler.limit = true

export default handler