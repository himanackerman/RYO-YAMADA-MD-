/*
* Fitur : Stickerly send stickerpack (EXIF Fix)
* Type : Plugins ESM 
* Creator : Hilman
* Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import JSZip from 'jszip'

if (!global.stickerlySession) global.stickerlySession = {}

class StickerLy {
  async search(keyword) {
    try {
      const { data } = await axios.post(
        'https://api.sticker.ly/v4/stickerPack/smartSearch',
        {
          keyword,
          enabledKeywordSearch: true,
          filter: {
            extendSearchResult: false,
            sortBy: 'RECOMMENDED',
            languages: ['ALL'],
            minStickerCount: 5,
            searchBy: 'ALL',
            stickerType: 'ALL'
          }
        },
        {
          headers: {
            'User-Agent': 'androidapp.stickerly/3.31.0 (M2006C3LG; U; Android 29; in-ID; id;)',
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      )

      let packs =
        data?.result?.stickerPacks ||
        data?.stickerPacks ||
        data?.data ||
        []

      return packs.map(v => ({
        id: v.packId,
        name: v.name,
        author: v.authorName || 'Unknown',
        count: v.resourceFiles?.length || 0,
        animated: v.isAnimated,
        prefix: v.resourceUrlPrefix,
        files: v.resourceFiles || [],
        url: v.shareUrl || `https://sticker.ly/s/${v.packId}`
      }))
    } catch (e) {
      console.log('Stickerly Search Error:', e.message)
      return []
    }
  }
}

const scraper = new StickerLy()

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

// Fungsi Re-encode WebP agar format chunk VP8X & Exif valid di WA
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
        packDescription: options.description || ` ${global.namebot || 'Bot'}`,

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

async function processAndSendPack(conn, m, urls, meta) {
  const size = 30
  const chunks = []

  for (let i = 0; i < urls.length; i += size) {
    chunks.push(urls.slice(i, i + size))
  }

  for (const chunk of chunks) {
    const pack = []

    for (const item of chunk) {
      try {
        const img = await axios.get(item.image, {
          responseType: 'arraybuffer',
          timeout: 20000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        let buffer = Buffer.from(img.data)
        if (buffer.length < 2048) continue

        buffer = await normalizeSticker(buffer)

        const type = classifySticker(buffer)
        pack.push({ buffer, ...type })
      } catch (e) {
        console.log('Sticker Fetch Error:', e.message)
      }
    }

    if (!pack.length) continue

    await sendCustomStickerPack(conn, m.chat, pack, {
      name: meta.name,
      publisher: meta.publisher,
      quoted: m
    })

    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} patrick`)
  }

  if (text.includes('|')) {
    const [, indexStr] = text.split('|')
    const session = global.stickerlySession?.[m.sender]

    if (!session) throw 'Sesi pencarian kadaluarsa. Silakan cari ulang.'

    const index = parseInt(indexStr.trim(), 10)
    const pick = session[index]

    if (!pick) throw 'Sticker pack tidak ditemukan.'

    await m.react('🕒')

    const urls = pick.files
      .slice(0, 30)
      .map(file => ({
        image: pick.prefix + file
      }))

    if (!urls.length) {
      await m.react('❌')
      return m.reply('❌ Sticker kosong.')
    }

    await processAndSendPack(
      conn,
      m,
      urls,
      {
        name: pick.name,
        publisher: global.packname || 'ʜɪʟᴍᴀɴ'
      }
    )

    await m.react('✅')
    return
  }

  const packs = await scraper.search(text)

  if (!packs.length) {
    return m.reply('❌ Sticker pack tidak ditemukan.')
  }

  global.stickerlySession[m.sender] = packs

  const firstPackWithCover = packs.find(v => v.prefix && v.files?.length)
  const coverUrl = firstPackWithCover ? firstPackWithCover.prefix + firstPackWithCover.files[0] : null

  const caption = `❀ *HASIL STICKER.LY*\n\nHasil pencarian untuk: *${text}*\nTotal: ${packs.length} pack`

  const btn = new Button(conn)
    .setBody(caption)
    .setFooter('Sticker.ly')

  if (coverUrl) btn.setImage(coverUrl)

  btn.addSelection('❀ Pilih Sticker Pack')
  btn.makeSection('Daftar Pack')

  packs.forEach((v, i) => {
    btn.makeRow(
      '📦',
      v.name,
      `Author: ${v.author} | Sticker: ${v.count}`,
      `${usedPrefix + command} pack|${i}`
    )
  })

  return await btn.send(m.chat, { quoted: m })
}

handler.help = ['stickerly']
handler.tags = ['sticker']
handler.command = /^stickerly$/i
handler.limit = true
handler.register = false

export default handler