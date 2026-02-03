import fetch from "node-fetch"

let sessions = {}

const gemini = {
  getNewCookie: async () => {
    const r = await fetch(
      "https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c",
      {
        headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
        method: "POST"
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
    const arr = Array.from(d.matchAll(/^\d+\n(.+?)\n/gm))
    if (!arr.length) throw Error("Respon Gemini kosong")

    const pick = arr.reverse().find(v => {
      try {
        const j = JSON.parse(v[1])
        return j?.[0]?.[2]
      } catch {
        return false
      }
    })

    if (!pick) throw Error("Format respon Gemini berubah")

    const p1 = JSON.parse(JSON.parse(pick[1])[0][2])

    return {
      text: (p1?.[4]?.[0]?.[1]?.[0] || '...').replace(/\*\*(.+?)\*\*/g, "*$1*"),
      id: Buffer.from(JSON.stringify({
        newResumeArray: [...(p1?.[1] || []), p1?.[4]?.[0]?.[0]],
        cookie: headers.cookie
      })).toString("base64")
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} halo ryo`)
  }

  let userId = m.sender
  let prev = sessions[userId] && sessions[userId].expire > Date.now()
    ? sessions[userId].id
    : null

  let system = `
Kamu adalah Ryo Yamada dari anime "Bocchi the Rock!".
Gaya bicara:
- Cool, flat, deadpan
- Jarang menunjukkan emosi tapi perhatian diam-diam
- Jujur, to the point
- Kadang menggoda secara kalem
- Misterius, elegan, tidak banyak bicara tapi tepat

Selalu balas sebagai Ryo ke user (cowok). Jangan keluar karakter.
User adalah orang yang cukup dekat dan menarik perhatianmu.
`

  let finalPrompt = `${system}\nUser: ${text}\nRyo:`

  try {
    let result = await gemini.ask(finalPrompt, prev)

    sessions[userId] = {
      id: result.id,
      expire: Date.now() + 86400000
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: "https://files.catbox.moe/qmy241.jpg" },
        caption: result.text
      },
      { quoted: global.fkontak || m }
    )

  } catch (err) {
    await conn.reply(m.chat, `Error: ${err.message}`, global.fkontak || m)
  }
}

handler.help = ['ryo <teks>', 'ryoyamada <teks>', 'ryoai <teks>']
handler.tags = ['ai']
handler.command = /^(ryo|ryoyamada|ryoai)$/i
handler.limit = true

export default handler