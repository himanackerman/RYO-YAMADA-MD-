import uguu from '../../lib/scrape/uguu.js'
import { downloadContentFromMessage } from 'baileys'

function getMediaContent(obj) {
  if (!obj) return { mtype: '', content: {} }

  let mtype = obj.mtype || (obj.message ? Object.keys(obj.message)[0] : '')
  let content = obj.message?.[mtype] || obj.msg || obj

  if (
    ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'].includes(mtype) &&
    content?.message
  ) {
    const innerType = Object.keys(content.message)[0]
    mtype = innerType
    content = content.message[innerType] || {}
  }

  return { mtype, content }
}

async function extractBuffer(item) {
  if (!item) return null
  let buffer = await item.download?.().catch(() => null)
  if (!buffer) {
    const { mtype, content } = getMediaContent(item)
    const type = mtype ? mtype.replace('Message', '') : 'image'
    try {
      const stream = await downloadContentFromMessage(content, type)
      buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
    } catch {
      buffer = null
    }
  }
  return buffer
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const { mtype, content } = getMediaContent(q)
  const mime = content?.mimetype || q.mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime) && mtype !== 'imageMessage') {
    return m.reply(
      `*Format salah!*\n\n` +
      `Kirim atau reply gambar dengan caption:\n` +
      `*${usedPrefix + command} <prompt edit>*\n\n` +
      `*Contoh:* ${usedPrefix + command} ubah jadi anime style`
    )
  }

  if (!text) {
    return m.reply(
      `*Prompt belum diisi!*\n\n` +
      `*Contoh:* ${usedPrefix + command} ubah jadi anime style`
    )
  }

  await m.react('🎨')

  try {
    const buffer = await extractBuffer(q)
    if (!buffer || !buffer.length) throw new Error('Gagal mengunduh gambar.')

    const upload = await uguu(buffer, 'editimg.jpg', 'image/jpeg')
    const imageUrl = upload?.url
    if (!imageUrl) throw new Error('Gagal upload gambar ke Uguu.')

    const promptEnc = encodeURIComponent(text.trim())
    const primaryUrl = `https://api-faa.my.id/faa/nano-banana?url=${encodeURIComponent(imageUrl)}&prompt=${promptEnc}`
    const fallbackUrl = `https://api-faa.my.id/faa/editfoto?url=${encodeURIComponent(imageUrl)}&prompt=${promptEnc}`

    let resultBuf = null

    try {
      const res = await fetch(primaryUrl)
      if (!res.ok) throw new Error(`API utama status ${res.status}`)
      const ct = res.headers.get('content-type') || ''
      const tmpBuf = Buffer.from(await res.arrayBuffer())
      if (!tmpBuf || !tmpBuf.length || !/image/.test(ct)) throw new Error('Hasil API utama kosong/bukan gambar')
      resultBuf = tmpBuf
    } catch (ePrimary) {
      console.error('[editimg] API utama gagal, mencoba fallback editfoto:', ePrimary.message || ePrimary)
      const res2 = await fetch(fallbackUrl)
      if (!res2.ok) throw new Error(`Kedua API editimg gagal (${res2.status})`)
      resultBuf = Buffer.from(await res2.arrayBuffer())
      if (!resultBuf || !resultBuf.length) throw new Error('Hasil edit kosong dari kedua API.')
    }

    const caption = `*\`EDIT IMAGE RESULT\`*\n\n` +
      `✿ Prompt : ${text.trim()}\n` +
      `✿ Status : Berhasil diedit`

    await conn.sendMessage(m.chat, {
      image: resultBuf,
      caption
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('[editimg] error:', e)
    await m.react('❌')
    throw e?.message || String(e)
  }
}

handler.help = ['editimg <prompt>', 'img2img <prompt>']
handler.tags = ['image']
handler.command = /^(editimg|img2img)$/i
handler.limit = 5
handler.register = true

export default handler
