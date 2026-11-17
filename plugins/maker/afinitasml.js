import uguu from '../../lib/scrape/uguu.js'
import { downloadContentFromMessage } from 'baileys'
import axios from 'axios'

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
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  let isMedia = /image\/(jpe?g|png)/.test(mime)

  let bg = text?.trim() || '1'

  await m.react('🕒')

  try {
    let imageUrl = ''

    if (isMedia) {
      let buffer = await extractBuffer(q)
      if (buffer && buffer.length) {
        let upload = await uguu(buffer, 'afinitas.jpg', 'image/jpeg')
        imageUrl = upload.url
      }
    }

    if (!imageUrl) {
      let pp = await conn.profilePictureUrl(m.quoted ? m.quoted.sender : m.sender, 'image').catch(() => null)
      if (pp) {
        let res = await axios.get(pp, { responseType: 'arraybuffer' })
        let upload = await uguu(Buffer.from(res.data), 'afinitas.jpg', 'image/jpeg')
        imageUrl = upload.url
      }
    }

    if (!imageUrl) {
      return m.reply(
        `*Contoh penggunaan:*\n\n` +
        `Kirim atau reply foto dengan teks:\n` +
        `*${usedPrefix + command} <nomor background 1-4>*\n\n` +
        `*Contoh:* ${usedPrefix + command} 1`
      )
    }

    let apiUrl = `${global.APIs.xrina}/canvas/afinitasml?image=${encodeURIComponent(imageUrl)}&bg=${encodeURIComponent(bg)}`

    let response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!response.data) throw 'Gagal memproses gambar Afinitas ML.'

    const caption = `*\`AFINITAS MLBB\`*\n\n` +
      `✿ Background : ${bg}\n` +
      `✿ Status : Berhasil dibuat`

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data),
      caption
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('Error Afinitas ML Canvas:', e)
    await m.react('❌')
    throw e?.message || String(e)
  }
}

handler.help = ['afinitasml', 'afinitasml <nomor bg>']
handler.tags = ['maker']
handler.command = /^(afinitasml|afinitas)$/i
handler.limit = true

export default handler
