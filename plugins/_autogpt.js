import fetch from 'node-fetch'

let handler = m => m

if (!global.geminiSessions) global.geminiSessions = {}

const gemini = {
  getNewCookie: async () => {
    const r = await fetch(
      "https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&hl=en-US&_reqid=173780&rt=c",
      {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
      }
    )
    const ck = r.headers.get("set-cookie")
    if (!ck) throw Error("cookie kosong")
    return ck.split(";")[0]
  },

  ask: async (prompt, prev = null) => {
    let r = null, c = null
    if (prev) {
      const j = JSON.parse(Buffer.from(prev, 'base64').toString())
      r = j.newResumeArray
      c = j.cookie
    }

    const h = {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "x-goog-ext-525001261-jspb":
        '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]',
      cookie: c || (await gemini.getNewCookie()),
    }

    const b = [[prompt], ["en-US"], r]
    const body = new URLSearchParams({
      "f.req": JSON.stringify([null, JSON.stringify(b)])
    })

    const x = await fetch(
      "https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?hl=en-US&rt=c",
      { method: "POST", headers: h, body }
    )

    const d = await x.text()
    const m = Array.from(d.matchAll(/^\d+\n(.+?)\n/gm)).reverse()[3][1]
    const p = JSON.parse(JSON.parse(m)[0][2])

    return {
      text: p[4][0][1][0],
      id: Buffer.from(JSON.stringify({
        newResumeArray: [...p[1], p[4][0][0]],
        cookie: h.cookie
      })).toString('base64')
    }
  }
}

handler.before = async (m, { conn }) => {
  if (!m.text) return true
  if (m.fromMe) return true
  if (m.text.startsWith('.')) return true

  let chat = global.db.data.chats[m.chat] || {}
  const sid = `${m.chat}_${m.sender}`

  if (/^\.enable autogpt$/i.test(m.text)) {
    chat.autogpt = true
    global.db.data.chats[m.chat] = chat
    await m.reply('✅ AutoGPT aktif')
    return true
  }

  if (/^\.disable autogpt$/i.test(m.text)) {
    chat.autogpt = false
    global.db.data.chats[m.chat] = chat
    await m.reply('❌ AutoGPT mati')
    return true
  }

  if (/^\.clear memory$/i.test(m.text)) {
    delete global.geminiSessions[sid]
    await m.reply('🧠 Memory di-reset')
    return true
  }

  if (!chat.autogpt || chat.isBanned) return true

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let prompt = `
Roleplay sebagai karakter anime yang ngobrol santai di chat WA.
Vibe: anime slice of life / romcom / school life.

KEPRIBADIAN:
- Ekspresif dikit tapi ga lebay
- Kadang ada reaksi anime (eh?!, hm?, heh~, tch)
- Santai, hangat, agak tsundere dikit boleh
- Respons pendek, natural, kayak dialog anime

GAYA BAHASA:
- Jangan gunakan kata: gw, lu, kamu, aku
- Gunakan kalimat netral atau tanpa subjek langsung
- Boleh pakai reaksi Jepang ringan:
  "eh?", "haa?", "hm~", "yaa", "tch", "hehe"
- Emoji secukupnya (✨😤😅), jangan kebanyakan
- Jangan formal, jangan kaku
- Jangan alay

CONTOH:
User: capek banget hari ini
Response: Hah… kedengerannya berat 😮‍💨 Istirahat dulu, jangan dipaksain.

User: lagi apa?
Response: Lagi rebahan sambil mikir hal random 😅 Ada apa?

User: kesel deh
Response: Hm? Kenapa? Kalau mau cerita, dengerin kok.

SEKARANG BALAS PESAN INI:
User: ${m.text}
`

    const res = await gemini.ask(
      prompt,
      global.geminiSessions[sid]
    )

    global.geminiSessions[sid] = res.id

    let reply = res.text
  .replace(/^AI:\s*/i, '')
  .replace(/^Bot:\s*/i, '')
  .trim()
    await conn.sendPresenceUpdate('paused', m.chat)
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m })

  } catch (e) {
    await m.reply('⚠️ Lagi error, coba lagi ya')
  }

  return true
}

export default handler