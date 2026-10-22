/* 
* creator hilman
* ryo yamada md
* channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import { sticker } from '../../lib/sticker.js'
import { downloadContentFromMessage } from 'baileys'
import crypto from 'crypto'
import https from 'https'
import JSZip from 'jszip'

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value
  if (value && value.type === 'Buffer' && Array.isArray(value.data)) return Buffer.from(value.data)
  if (typeof value === 'string') return Buffer.from(value, 'base64')
  throw new Error('Format buffer tidak dikenali')
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest()
}

function toB64Url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function isWebP(buffer) {
  return buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
}

function isAnimatedWebP(buffer) {
  if (!isWebP(buffer)) return false

  let offset = 12

  while (offset < buffer.length - 8) {
    const chunk = buffer.toString('ascii', offset, offset + 4)
    const size = buffer.readUInt32LE(offset + 4)

    if (chunk === 'VP8X' && (buffer[offset + 8] & 0x02)) return true
    if (chunk === 'ANIM' || chunk === 'ANMF') return true

    offset += 8 + size + (size % 2)
  }

  return false
}

async function normalizeSticker(buffer) {
  const sharpMod = await import('sharp').catch(() => null)
  if (!sharpMod?.default) return buffer

  try {
    const isAnim = isAnimatedWebP(buffer)
    return await sharpMod.default(buffer, { animated: isAnim })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 70, effort: 4 })
      .toBuffer()
  } catch {
    return buffer
  }
}

function classifySticker(buffer) {
  return { ext: 'webp', mimetype: 'image/webp', isAnimated: isAnimatedWebP(buffer), isLottie: false }
}

async function makeTrayWebp(buffer) {
  const sharpMod = await import('sharp').catch(() => null)
  if (!sharpMod?.default) throw new Error('Install sharp dulu:\nnpm i sharp')

  return await sharpMod.default(buffer, { animated: false })
    .resize(252, 252, { fit: 'cover' })
    .webp()
    .toBuffer()
}

async function makeBlankTrayWebp() {
  const sharpMod = await import('sharp').catch(() => null)
  if (!sharpMod?.default) throw new Error('Install sharp dulu:\nnpm i sharp')

  return await sharpMod.default({
    create: {
      width: 252,
      height: 252,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .webp()
    .toBuffer()
}

async function makeThumbnailJpeg(buffer) {
  const sharpMod = await import('sharp').catch(() => null)
  if (!sharpMod?.default) throw new Error('Install sharp dulu:\nnpm i sharp')

  return await sharpMod.default(buffer)
    .resize(252, 252, { fit: 'cover' })
    .jpeg()
    .toBuffer()
}

async function uploadToServer(conn, buffer, { hkdf, mediaPath, mediaKey = crypto.randomBytes(32) }) {
  const expanded = Buffer.from(
    crypto.hkdfSync('sha256', mediaKey, Buffer.alloc(32), Buffer.from(hkdf), 112),
  )

  const iv = expanded.subarray(0, 16)
  const cipherKey = expanded.subarray(16, 48)
  const macKey = expanded.subarray(48, 80)

  const cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])

  const mac = crypto
    .createHmac('sha256', macKey)
    .update(iv)
    .update(encrypted)
    .digest()
    .subarray(0, 10)

  const encBuffer = Buffer.concat([encrypted, mac])

  const fileSha256 = sha256(buffer)
  const fileEncSha256 = sha256(encBuffer)

  const iq = await conn.query({
    tag: 'iq',
    attrs: {
      id: conn.generateMessageTag?.() ?? Date.now().toString(),
      to: 's.whatsapp.net',
      type: 'set',
      xmlns: 'w:m',
    },
    content: [{ tag: 'media_conn', attrs: {} }],
  })

  const mediaConn = iq.content?.find(v => v.tag === 'media_conn')
  if (!mediaConn) throw new Error('media_conn tidak ditemukan')

  const auth = mediaConn.attrs?.auth
  if (!auth) throw new Error('auth media_conn tidak ditemukan')

  const hosts = (mediaConn.content || [])
    .filter(v => v.tag === 'host')
    .map(v => v.attrs?.hostname)
    .filter(Boolean)

  if (!hosts.length) throw new Error('host upload tidak ditemukan')

  const token = encodeURIComponent(
    fileEncSha256.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''),
  )

  let lastError

  for (const host of hosts) {
    try {
      const json = await new Promise((resolve, reject) => {
        const url = new URL(
          `https://${host}${mediaPath}/${token}?auth=${encodeURIComponent(auth)}&token=${token}`,
        )

        const req = https.request(
          {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
              Origin: 'https://web.whatsapp.com',
              Referer: 'https://web.whatsapp.com/',
              'Content-Type': 'application/octet-stream',
              'Content-Length': encBuffer.length,
            },
          },
          (res) => {
            let body = ''

            res.on('data', c => body += c)

            res.on('end', () => {
              if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Upload gagal ${res.statusCode}: ${body}`))
              }

              try {
                resolve(JSON.parse(body))
              } catch {
                reject(new Error(`Response bukan JSON: ${body}`))
              }
            })
          },
        )

        req.on('error', reject)
        req.write(encBuffer)
        req.end()
      })

      const directPath = json.direct_path ?? json.directPath ?? json.url ?? json.path
      if (!directPath) throw new Error('directPath tidak ditemukan')

      return {
        mediaKey,
        fileLength: buffer.length,
        fileSha256,
        fileEncSha256,
        directPath,
        ...json,
      }
    } catch (e) {
      lastError = e
    }
  }

  throw lastError ?? new Error('Semua host upload gagal')
}

async function sendCustomStickerPack(conn, jid, pack, options = {}) {
  const zip = new JSZip()
  const stickersMetadata = []
  const hydrated = pack.map(item => ({ ...item, buffer: toBuffer(item.buffer) }))

  for (const item of hydrated) {
    const fileName = `${toB64Url(sha256(item.buffer))}.${item.ext}`

    zip.file(fileName, item.buffer)

    stickersMetadata.push({
      fileName,
      isAnimated: item.isAnimated,
      emojis: [''],
      accessibilityLabel: '',
      isLottie: item.isLottie,
      mimetype: item.mimetype,
    })
  }

  const trayIconFileName = 'tray_icon.webp'
  const traySource = hydrated.find(v => !v.isLottie)?.buffer

  const trayBuffer = traySource
    ? await makeTrayWebp(traySource)
    : await makeBlankTrayWebp()

  zip.file(trayIconFileName, trayBuffer)

  const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' })

  const packUpload = await uploadToServer(conn, archive, {
    hkdf: 'WhatsApp Sticker Pack Keys',
    mediaPath: '/mms/sticker-pack',
  })

  const thumbnailBuffer = await makeThumbnailJpeg(trayBuffer)

  const thumbUpload = await uploadToServer(conn, thumbnailBuffer, {
    hkdf: 'WhatsApp Sticker Pack Thumbnail Keys',
    mediaPath: '/mms/thumbnail-sticker-pack',
    mediaKey: packUpload.mediaKey,
  })

  return await conn.relayMessage(
    jid,
    {
      messageContextInfo: {
        messageSecret: crypto.randomBytes(32),
      },
      stickerPackMessage: {
        stickerPackId: 'Pack_' + crypto.randomBytes(8).toString('hex'),
        name: options.name || global.namebot || 'Sticker Pack',
        publisher: options.publisher || global.author || 'Bot',
        packDescription: options.description || `❀ ${global.namebot || 'Bot'}`,

        stickers: stickersMetadata,

        fileLength: packUpload.fileLength,
        fileSha256: packUpload.fileSha256,
        fileEncSha256: packUpload.fileEncSha256,
        mediaKey: packUpload.mediaKey,
        directPath: packUpload.directPath,
        mediaKeyTimestamp: Math.floor(Date.now() / 1000),
        stickerPackSize: packUpload.fileLength,
        stickerPackOrigin: 2,

        trayIconFileName,
        thumbnailDirectPath: thumbUpload.directPath,
        thumbnailSha256: thumbUpload.fileSha256,
        thumbnailEncSha256: thumbUpload.fileEncSha256,
        thumbnailHeight: 252,
        thumbnailWidth: 252,
        imageDataHash: thumbUpload.fileSha256.toString('base64'),
      },
    },
    options.quoted ? { quoted: options.quoted } : {}
  )
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

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let [packname, ...authorArr] = args.join(' ').split('|')

  packname = packname || global.stickpack || 'ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ'

  let author =
    authorArr.join('|') ||
    global.stickauth ||
    'ʙʏ ʜɪʟᴍᴀɴ'

  let q = m.quoted ? m.quoted : m
  const rawList = []

  const quotedId = m.quoted?.key?.id || m.quoted?.id

  if (quotedId && global.albumCache?.has(quotedId)) {
    rawList.push(
      ...(global.albumCache.get(quotedId)?.messages || [])
    )
  }

  if (rawList.length >= 2) {
    await m.react('🕒')

    try {
      const pack = []

      for (const item of rawList) {
        const { mtype, content } = getMediaContent(item)
        const mime = content?.mimetype || ''

        const isImage = mtype === 'imageMessage' || mime.startsWith('image/')
        const isVideo = mtype === 'videoMessage' || mime.startsWith('video/')

        if (!isImage && !isVideo) continue
        if (isVideo && content?.seconds > 15) continue

        let buffer = await item.download?.().catch(() => null)

        if (!buffer) {
          const type = mtype ? mtype.replace('Message', '') : 'image'
          const stream = await downloadContentFromMessage(content, type)

          buffer = Buffer.from([])
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
          }
        }

        if (!buffer || !buffer.length) continue

        let webp = await sticker(buffer, false, packname, author)
        if (!webp || !Buffer.isBuffer(webp)) continue

        webp = await normalizeSticker(webp)
        const type = classifySticker(webp)

        pack.push({ buffer: webp, ...type })
      }

      if (pack.length === 0) {
        throw 'Gagal memproses media dalam album.'
      }

      await sendCustomStickerPack(conn, m.chat, pack, {
        name: packname,
        publisher: author,
        quoted: m
      })

      await m.react('✅')
      return
    } catch (e) {
      console.error('Sticker Pack error:', e)
      await m.react('❌')
      throw e.message || e
    }
  }

  try {
    await m.react('🕒')

    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!mime && q.message) {
      const type = Object.keys(q.message)[0]
      if (type === 'imageMessage') mime = 'image/jpeg'
      if (type === 'videoMessage') mime = 'video/mp4'
    }

    if (/video/g.test(mime)) {
      if ((q.msg || q).seconds > 10) {
        await m.react('❌')
        return m.reply('Maksimal 10 detik')
      }

      const img = await q.download?.()
      if (!img) throw `Balas video dengan *${usedPrefix + command}*`

      const stiker = await sticker(img, false, packname, author)
      if (!stiker) throw 'Gagal membuat sticker'

      await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
      await m.react('✅')
    } else if (/image/g.test(mime)) {
      const img = await q.download?.()
      if (!img) throw `Balas gambar dengan *${usedPrefix + command}*`

      const stiker = await sticker(img, false, packname, author)
      if (!stiker) throw 'Gagal membuat sticker'

      await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
      await m.react('✅')
    } else {
      await m.react('❌')
      m.reply(`Balas gambar/video dengan *${usedPrefix + command}*, atau kirim/reply *album* buat sticker pack.`)
    }
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan')
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = /^s(tic?ker)?(gif)?$/i
handler.register = false

export default handler