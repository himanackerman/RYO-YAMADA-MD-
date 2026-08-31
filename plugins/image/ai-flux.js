import fetch from 'node-fetch'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  try {
    let prompt = (text || args?.join(" ") || (m.quoted && (m.quoted.text || m.quoted?.message?.conversation)))?.trim()
    if (!prompt) return conn.sendMessage(m.chat, { text: `Masukkan prompt.\nContoh:\n${usedPrefix + (command || 'flux')} langit malam penuh bintang gaya anime` }, { quoted: m })

    await conn.sendMessage(m.chat, { text: `🔎 Menghasilkan gambar untuk prompt:\n"${prompt}"\nTunggu sebentar...` }, { quoted: m })

    const endpoint = `https://fast-flux-demo.replicate.workers.dev/api/generate-image?text=${encodeURIComponent(prompt)}`
    const res = await fetch(endpoint, { method: 'GET', headers: { 'Accept': 'application/json' } })
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const j = await res.json().catch(() => null)
      if (!j) throw new Error('Response JSON tidak bisa dibaca.')

      if (j.url) return conn.sendMessage(m.chat, { image: { url: j.url }, caption: `Prompt: ${prompt}` }, { quoted: m })
      if (Array.isArray(j.images) && j.images.length) return conn.sendMessage(m.chat, { image: { url: j.images[0] }, caption: `Prompt: ${prompt}` }, { quoted: m })
      if (j.image && typeof j.image === 'string') {
        let b64 = j.image.replace(/^data:.*;base64,/, '')
        let buffer = Buffer.from(b64, 'base64')
        return conn.sendMessage(m.chat, { image: buffer, caption: `Prompt: ${prompt}` }, { quoted: m })
      }

      const maybe = j.output || j.result || j.data
      if (maybe) {
        if (typeof maybe === 'string' && maybe.startsWith('http')) return conn.sendMessage(m.chat, { image: { url: maybe }, caption: `Prompt: ${prompt}` }, { quoted: m })
        if (Array.isArray(maybe) && maybe.length) {
          const first = maybe[0]
          if (typeof first === 'string' && first.startsWith('http')) return conn.sendMessage(m.chat, { image: { url: first }, caption: `Prompt: ${prompt}` }, { quoted: m })
          if (typeof first === 'string' && first.startsWith('data:')) {
            let b64 = first.replace(/^data:.*;base64,/, '')
            let buffer = Buffer.from(b64, 'base64')
            return conn.sendMessage(m.chat, { image: buffer, caption: `Prompt: ${prompt}` }, { quoted: m })
          }
        }
      }

      throw new Error('Tidak menemukan URL atau image di response.')
    }

    if (contentType.startsWith('image/') || contentType === '') {
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      return conn.sendMessage(m.chat, { image: buffer, caption: `Prompt: ${prompt}` }, { quoted: m })
    }

    const textRes = await res.text().catch(() => null)
    throw new Error(`Gagal memproses response API. Response: ${textRes || 'empty'}`)
  } catch (err) {
    const em = err?.message || String(err)
    return conn.sendMessage(m.chat, { text: `❌ Gagal menghasilkan gambar:\n${em}` }, { quoted: m })
  }
}

handler.help = ['flux <prompt>']
handler.tags = ['image', 'ai']
handler.command = /^((flux|fluximg|flux-image))$/i
handler.limit = true

export default handler