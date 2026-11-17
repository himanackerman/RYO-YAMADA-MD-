/*
* fitur : fakemlduo
* api : ${global.APIs.xrina}/docs
* type : plugins esm 
* creator : hilman 
* channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import { downloadContentFromMessage } from 'baileys'
import axios from 'axios'
import FormData from 'form-data'

async function uguu(buffer, filename = 'image.jpg', mime = 'image/jpeg') {
  const form = new FormData()
  form.append('files[]', buffer, { filename, contentType: mime })

  const res = await axios.post('https://uguu.se/upload', form, {
    headers: form.getHeaders()
  })

  return {
    url: res.data.files[0].url
  }
}

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
    throw `Format salah!\n\n*Contoh penggunaan:*\n` +
      `• Reply album 2 foto: *${usedPrefix + command} Rin | Mark*\n` +
      `• Dengan pilihan template (1-4): *${usedPrefix + command} 1 | Rin | Mark*\n\n` +
      `_Catatan: Kirim 2 foto secara bersamaan (album), lalu reply pesan album tersebut dengan command di atas._`
  }

  const parts = text.split('|').map(v => v.trim())
  let tpl = '1'
  let name1 = ''
  let name2 = ''

  if (parts.length >= 3 && /^[0-9]+$/.test(parts[0])) {
    tpl = parts[0]
    name1 = parts[1]
    name2 = parts[2]
  } else if (parts.length >= 2) {
    name1 = parts[0]
    name2 = parts[1]
    if (parts[2] && /^[0-9]+$/.test(parts[2])) {
      tpl = parts[2]
    }
  } else {
    throw `Format nama kurang lengkap!\nContoh: *${usedPrefix + command} Rin | Mark* atau *${usedPrefix + command} 1 | Rin | Mark*`
  }

  await m.react('🕒')

  try {
    let pp1Url = ''
    let pp2Url = ''

    const quotedId = m.quoted?.key?.id || m.quoted?.id
    const albumEntry = quotedId ? global.albumCache?.get(quotedId) : null
    const rawList = albumEntry?.messages || []

    const imageBuffers = []

    if (rawList.length >= 2) {
      for (const item of rawList) {
        const { mtype, content } = getMediaContent(item)
        const mime = content?.mimetype || ''
        if (mtype === 'imageMessage' || mime.startsWith('image/')) {
          const buf = await extractBuffer(item)
          if (buf && buf.length) imageBuffers.push(buf)
        }
        if (imageBuffers.length >= 2) break
      }
    }

    if (imageBuffers.length < 2 && m.quoted) {
      const qBuf = await extractBuffer(m.quoted)
      if (qBuf && qBuf.length) {
        imageBuffers.push(qBuf)
      }
    }

    if (imageBuffers.length >= 2) {
      const upload1 = await uguu(imageBuffers[0], 'pp1.jpg', 'image/jpeg')
      const upload2 = await uguu(imageBuffers[1], 'pp2.jpg', 'image/jpeg')
      pp1Url = upload1.url
      pp2Url = upload2.url
    } else if (imageBuffers.length === 1) {
      const upload1 = await uguu(imageBuffers[0], 'pp1.jpg', 'image/jpeg')
      pp1Url = upload1.url
      let ppUser = await conn.profilePictureUrl(m.sender, 'image').catch(() => null)
      if (ppUser) {
        const res = await axios.get(ppUser, { responseType: 'arraybuffer' })
        const up = await uguu(Buffer.from(res.data), 'pp2.jpg', 'image/jpeg')
        pp2Url = up.url
      }
    } else {
      let senderPP = await conn.profilePictureUrl(m.sender, 'image').catch(() => null)
      let targetPP = m.mentionedJid?.[0] ? await conn.profilePictureUrl(m.mentionedJid[0], 'image').catch(() => null) : null

      if (senderPP && targetPP) {
        const [res1, res2] = await Promise.all([
          axios.get(senderPP, { responseType: 'arraybuffer' }),
          axios.get(targetPP, { responseType: 'arraybuffer' })
        ])
        const [up1, up2] = await Promise.all([
          uguu(Buffer.from(res1.data), 'pp1.jpg', 'image/jpeg'),
          uguu(Buffer.from(res2.data), 'pp2.jpg', 'image/jpeg')
        ])
        pp1Url = up1.url
        pp2Url = up2.url
      }
    }

    if (!pp1Url || !pp2Url) {
      throw `Silakan reply pesan *album (2 foto)* dengan caption:\n*${usedPrefix + command} ${name1} | ${name2}*`
    }

    const apiUrl = `${global.APIs.xrina}/canvas/mlduo?tpl=${encodeURIComponent(tpl)}&name1=${encodeURIComponent(name1)}&name2=${encodeURIComponent(name2)}&pp1=${encodeURIComponent(pp1Url)}&pp2=${encodeURIComponent(pp2Url)}`

    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!response.data) throw 'Gagal mengunduh hasil canvas ML Duo.'

    const caption = `*\`MLBB DUO CANVAS\`*\n\n` +
      `✿ Template : ${tpl}\n` +
      `✿ Player 1 : ${name1}\n` +
      `✿ Player 2 : ${name2}`

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data),
      caption
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('Error ML Duo Canvas:', e)
    await m.react('❌')
    throw e?.message || String(e)
  }
}

handler.help = ['mlduo <nama1> | <nama2>', 'mlduo <tpl> | <nama1> | <nama2>']
handler.tags = ['maker']
handler.command = /^(mlduo|fakemlduo|duoml)$/i
handler.limit = true

export default handler