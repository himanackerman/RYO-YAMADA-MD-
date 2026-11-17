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
  if (!text) {
    return m.reply(
      `Contoh penggunaan:\n\n` +
      `Kirim/reply foto dengan teks:\n` +
      `*${usedPrefix + command} username | pesan*\n\n` +
      `*Contoh:* ${usedPrefix + command} mark | yahaha`
    )
  }

  let [username, ...pesanArr] = text.split('|').map(v => v.trim())
  let messageText = pesanArr.join('|').trim()

  if (!username || !messageText) {
    return m.reply(
      `Format salah!\n\n` +
      `*Contoh:* ${usedPrefix + command} mark | yahaha`
    )
  }

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  let isMedia = /image\/(jpe?g|png)/.test(mime)

  await m.react('🕒')

  try {
    let photoUrl = ''

    if (isMedia) {
      let buffer = await extractBuffer(q)
      if (buffer && buffer.length) {
        let upload = await uguu(buffer, 'profile.jpg', 'image/jpeg')
        photoUrl = upload.url
      }
    }

    if (!photoUrl) {
      let pp = await conn.profilePictureUrl(m.quoted ? m.quoted.sender : m.sender, 'image').catch(() => null)
      if (pp) {
        let res = await axios.get(pp, { responseType: 'arraybuffer' })
        let upload = await uguu(Buffer.from(res.data), 'profile.jpg', 'image/jpeg')
        photoUrl = upload.url
      }
    }

    if (!photoUrl) {
      throw `Silakan kirim atau reply foto dengan format:\n*${usedPrefix + command} ${username} | ${messageText}*`
    }

    let apiUrl = `${global.APIs.xrina}/canvas/ttdm?url=${encodeURIComponent(photoUrl)}&username=${encodeURIComponent(username)}&text=${encodeURIComponent(messageText)}`

    let response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!response.data) throw 'Gagal memproses gambar TikTok DM.'

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data)
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('Error TikTok DM Canvas:', e)
    await m.react('❌')
    throw e?.message || String(e)
  }
}

handler.help = ['ttdm <username> | <teks>']
handler.tags = ['maker']
handler.command = /^(ttdm|fakettdm|tiktokdm)$/i
handler.limit = true

export default handler
