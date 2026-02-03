/**
  *» Nama :* — [ VEO2 AI ] —
  *» Type :* Plugin - ESM
  *» Base Url :* http://34.175.222.176:7865
  *» Saluran :* https://whatsapp.com/channel/0029Vb7XfVV2v1IzPVqjgq37
  *» Creator :* -Ɗαnčoᴡ々
**/

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} a cat sleeping on a sofa`)

  m.reply('⏳ Sedang generate video, mohon tunggu...')

  const BASE = 'http://34.175.222.176:7865'
  const sessionHash = Math.random().toString(36).slice(2)
  const TIMEOUT = 180000

  const abortFetch = async (url, opt = {}) => {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), TIMEOUT)
    try {
      return await fetch(url, { ...opt, signal: c.signal })
    } finally {
      clearTimeout(t)
    }
  }

  try {
    const join = await abortFetch(`${BASE}/gradio_api/queue/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Referer': `${BASE}/`
      },
      body: JSON.stringify({
        data: [text, null, '', '16:9', 'dont_allow', 1, 6, true],
        fn_index: 0,
        trigger_id: Math.floor(Math.random() * 100),
        session_hash: sessionHash
      })
    })

    const j = await join.json()
    if (!j.event_id) throw 'Gagal submit job'

    const sse = await abortFetch(`${BASE}/gradio_api/queue/data?session_hash=${sessionHash}`, {
      headers: {
        Accept: 'text/event-stream',
        'User-Agent': 'Mozilla/5.0',
        Referer: `${BASE}/`
      }
    })

    if (!sse.ok) throw 'Gagal koneksi SSE'

    let buffer = ''
    let videoUrl
    const start = Date.now()

    await new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (Date.now() - start > TIMEOUT) {
          sse.body.destroy()
          reject('Timeout generate video')
        }
      }, 1000)

      sse.body.on('data', chunk => {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let json
          try {
            json = JSON.parse(raw)
          } catch {
            continue
          }

          if (json.msg === 'process_completed') {
            const out = json.output?.data
            if (Array.isArray(out)) {
              for (const x of out.flat(Infinity)) {
                if (x?.video?.url) videoUrl = x.video.url
                else if (typeof x === 'string' && x.includes('.mp4')) videoUrl = x
                else if (x?.data && typeof x.data === 'string' && x.data.includes('.mp4')) videoUrl = x.data
              }
            }
            if (videoUrl) {
              clearInterval(timer)
              sse.body.destroy()
              resolve()
            }
          }
        }
      })

      sse.body.on('error', () => reject('SSE error'))
      sse.body.on('end', () => resolve())
    })

    if (!videoUrl) throw 'Video gagal dihasilkan (kosong / disensor)'

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: `🎬 Video Generated\n\nPrompt:\n${text}`
      },
      { quoted: m }
    )
  } catch (e) {
    m.reply(`❌ ${e}`)
  }
}

handler.help = ['veo2 <prompt>']
handler.tags = ['ai']
handler.command = ['veo2']
handler.limit = true 
handler.register = true

export default handler