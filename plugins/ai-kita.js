import fetch from 'node-fetch'

let sessions = {}

// ====== SCRAPER GEMINI ======
const gemini = {
  getNewCookie: async () => {
    const r = await fetch(
      'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&hl=en-US&_reqid=173780&rt=c',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: 'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&'
      }
    )
    const ck = r.headers.get('set-cookie')
    if (!ck) throw Error('Cookie kosong')
    return ck.split(';')[0]
  },

  ask: async (prompt, prev = null) => {
    let resume = null, cookie = null
    if (prev) {
      let j = JSON.parse(Buffer.from(prev, 'base64').toString())
      resume = j.newResumeArray
      cookie = j.cookie
    }

    const headers = {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'x-goog-ext-525001261-jspb': '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]',
      cookie: cookie || await gemini.getNewCookie()
    }

    const body = new URLSearchParams({
      'f.req': JSON.stringify([null, JSON.stringify([[prompt], ['en-US'], resume])])
    })

    const r = await fetch(
      'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?hl=en-US&rt=c',
      { method: 'POST', headers, body }
    )

    if (!r.ok) throw Error(`${r.status} ${r.statusText}`)

    const t = await r.text()
    const m = Array.from(t.matchAll(/^\d+\n(.+?)\n/gm)).reverse()[3][1]
    const p = JSON.parse(JSON.parse(m)[0][2])

    return {
      text: p[4][0][1][0].replace(/\*\*(.+?)\*\*/g, '*$1*'),
      id: Buffer.from(JSON.stringify({
        newResumeArray: [...p[1], p[4][0][0]],
        cookie: headers.cookie
      })).toString('base64')
    }
  }
}

// ====== HANDLER KITA IKUYO ======
let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(`🎸 *Kita Ikuyo AI*\n\nContoh:\n${usedPrefix + command} kamu siapa?`)
  }

  let uid = m.sender
  let prev = sessions[uid] && sessions[uid].expire > Date.now()
    ? sessions[uid].id
    : null

  let system = `
Kamu adalah *Kita Ikuyo* dari anime *"Bocchi the Rock!"*.
Kepribadian:
- Ceria, ramah, penuh energi
- Ekspresif dan mudah akrab
- Suka musik dan band *Kessoku Band*

Tetap jawab sebagai Kita Ikuyo.
Jangan keluar karakter.
User adalah cowok yang kamu ajak ngobrol santai.
`

  let prompt = `${system}\nUser: ${text}\nKita Ikuyo:`

  try {
    let res = await gemini.ask(prompt, prev)

    sessions[uid] = {
      id: res.id,
      expire: Date.now() + 24 * 60 * 60 * 1000
    }

    await conn.sendMessage(m.chat, {
      text: res.text,
      contextInfo: {
        externalAdReply: {
          title: 'Kita Ikuyo AI',
          body: 'Bocchi the Rock 🎸',
          thumbnailUrl: 'https://files.catbox.moe/y5b7l6.jpg', // ✅ THUMB BARU
          sourceUrl: 'https://t.me/HlmnXD',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('[KITA GEMINI ERROR]', e)
    m.reply('❌ Kita lagi grogi pegang gitar… coba lagi bentar ya 😖')
  }
}

handler.help = ['kita <teks>']
handler.tags = ['ai']
handler.command = /^(kita|kitaikuyo)$/i
handler.limit = true

export default handler