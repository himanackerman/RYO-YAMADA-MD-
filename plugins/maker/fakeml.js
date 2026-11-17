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
  const nickname = text?.trim()

  if (!nickname) {
    return m.reply(
      `Contoh penggunaan:\n\n` +
      `Kirim/reply foto dengan teks:\n` +
      `*${usedPrefix + command} nickname*\n\n` +
      `*Contoh:* ${usedPrefix + command} mark`
    )
  }

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  let isMedia = /image\/(jpe?g|png)/.test(mime)

  await m.react('🕒')

  try {
    let avatarUrl = ''

    if (isMedia) {
      let buffer = await extractBuffer(q)
      if (buffer && buffer.length) {
        let upload = await uguu(buffer, 'avatar.jpg', 'image/jpeg')
        avatarUrl = upload.url
      }
    }

    if (!avatarUrl) {
      let pp = await conn.profilePictureUrl(m.quoted ? m.quoted.sender : m.sender, 'image').catch(() => null)
      if (pp) {
        let res = await axios.get(pp, { responseType: 'arraybuffer' })
        let upload = await uguu(Buffer.from(res.data), 'avatar.jpg', 'image/jpeg')
        avatarUrl = upload.url
      }
    }

    if (!avatarUrl) {
      throw `Silakan kirim atau reply foto dengan format:\n*${usedPrefix + command} ${nickname}*`
    }

    let apiUrl = `${global.APIs.xrina}/canvas/fakeml?avatar=${encodeURIComponent(avatarUrl)}&username=${encodeURIComponent(nickname)}`

    let response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!response.data) throw 'Gagal memproses gambar Fake ML Lobby.'

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data)
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('Error Fake ML Canvas:', e)
    await m.react('❌')
    throw e?.message || String(e)
  }
}

handler.help = ['fakeml <nickname>']
handler.tags = ['maker']
handler.command = /^(fakeml|mlobby|mlsolo)$/i
handler.limit = true

export default handler
