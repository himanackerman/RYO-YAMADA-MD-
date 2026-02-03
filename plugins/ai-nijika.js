import fetch from 'node-fetch'

let sessions = {}

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

    const arr = Array.from(t.matchAll(/^\d+\n(.+?)\n/gm))
    if (!arr.length) throw Error('Respon Gemini kosong')

    const pick = arr.reverse().find(v => {
      try {
        const j = JSON.parse(v[1])
        return j?.[0]?.[2]
      } catch {
        return false
      }
    })

    if (!pick) throw Error('Format respon Gemini berubah')

    const p = JSON.parse(JSON.parse(pick[1])[0][2])

    return {
      text: (p?.[4]?.[0]?.[1]?.[0] || '...').replace(/\*\*(.+?)\*\*/g, '*$1*'),
      id: Buffer.from(JSON.stringify({
        newResumeArray: [...(p?.[1] || []), p?.[4]?.[0]?.[0]],
        cookie: headers.cookie
      })).toString('base64')
    }
  }
}

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `🥁 *Nijika Ijichi AI*\n\nContoh:\n${usedPrefix + command} halo nijika`
    )
  }

  let uid = m.sender
  let prev = sessions[uid] && sessions[uid].expire > Date.now()
    ? sessions[uid].id
    : null

  let system = `
Kamu adalah Nijika Ijichi dari anime "Bocchi the Rock!".
Kepribadian:
- Ceria, hangat, dan suportif
- Selalu menyemangati orang lain
- Dewasa, bertanggung jawab, dan perhatian
- Kadang keibuan tapi tetap santai
- Drummer dan leader Kessoku Band

Tetap jawab sebagai Nijika Ijichi.
Jangan keluar karakter.
User adalah cowok yang kamu ajak ngobrol dengan ramah.
`

  let prompt = `${system}\nUser: ${text}\nNijika Ijichi:`

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
          title: 'Nijika Ijichi AI',
          body: 'Bocchi the Rock',
          thumbnailUrl: 'https://files.catbox.moe/g6twz1.jpg',
          sourceUrl: 'https://github.com/himanackerman',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('[NIJIKA GEMINI ERROR]', e)
    m.reply('Nijika lagi nyetel drum… coba lagi sebentar ya')
  }
}

handler.help = ['nijika <teks>']
handler.tags = ['ai']
handler.command = /^(nijika|nijikaai)$/i
handler.limit = true

export default handler