/*
* Fitur : Telegram Sticker to stickerpack
* Type : Plugins ESM
* creator : hilman
* channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
* Note : butuh jszip ke-install di project (npm i jszip)
*/

import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import JSZip from 'jszip'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

async function telestick(url) {
  const match = url.match(/https:\/\/t\.me\/addstickers\/([^\/\?#]+)/)
  if (!match) throw 'URL tidak valid!'

  const { data } = await axios.get(`https://api.nexray.eu.cc/tools/telegram-sticker?url=${encodeURIComponent(url)}`)

  if (!data?.status || !data?.result?.sticker?.length) {
    throw 'Gagal ambil sticker.'
  }

  const stickers = data.result.sticker.map(st => {
    const isVideo = st.is_animated || st.url.endsWith('.webm') || st.url.endsWith('.mp4')
    return {
      is_animated: isVideo,
      is_video: isVideo,
      url: st.url
    }
  })

  return {
    title: data.result.title || match[1],
    stickers
  }
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

async function loadSharp() {
  const sharpMod = await import('sharp').catch(() => null)
  if (!sharpMod?.default) throw new Error('Install sharp dulu:\nnpm i sharp')
  return sharpMod.default
}

async function loadFfmpegPath() {
  const mod = await import('ffmpeg-static').catch(() => null)
  return mod?.default || mod || 'ffmpeg'
}

async function convertVideoToWebp(buffer) {
  const ffmpegPath = await loadFfmpegPath()
  const id = crypto.randomBytes(6).toString('hex')
  const inputPath = path.join(os.tmpdir(), `tg_${id}.webm`)
  const outputPath = path.join(os.tmpdir(), `tg_${id}.webp`)

  await fs.writeFile(inputPath, buffer)

  await new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', inputPath,
      '-vcodec', 'libwebp',
      '-vf', "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1",
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      outputPath
    ]

    const proc = spawn(ffmpegPath, args)
    let stderr = ''

    proc.stderr.on('data', d => stderr += d)
    proc.on('error', reject)
    proc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exit ${code}: ${stderr}`))
    })
  })

  const out = await fs.readFile(outputPath)

  await fs.unlink(inputPath).catch(() => {})
  await fs.unlink(outputPath).catch(() => {})

  return out
}

async function normalizeSticker(buffer) {
  const sharp = await loadSharp()
  const animated = isAnimatedWebP(buffer)

  const webpBuffer = await sharp(buffer, { animated })
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 90, lossless: false, loop: 0 })
    .toBuffer()

  return {
    buffer: webpBuffer,
    ext: 'webp',
    mimetype: 'image/webp',
    isAnimated: animated,
    isLottie: false
  }
}

async function normalizeVideoSticker(buffer) {
  const webpBuffer = await convertVideoToWebp(buffer)

  return {
    buffer: webpBuffer,
    ext: 'webp',
    mimetype: 'image/webp',
    isAnimated: true,
    isLottie: false
  }
}

async function makeTrayWebp(buffer) {
  const sharp = await loadSharp()

  return await sharp(buffer, { animated: false })
    .resize(252, 252, { fit: 'cover' })
    .webp()
    .toBuffer()
}

async function makeBlankTrayWebp() {
  const sharp = await loadSharp()

  return await sharp({
    create: {
      width: 252,
      height: 252,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .webp()
    .toBuffer()
}

async function makeThumbnailJpeg(buffer) {
  const sharp = await loadSharp()

  return await sharp(buffer)
    .resize(252, 252, { fit: 'cover' })
    .jpeg()
    .toBuffer()
}

async function uploadToServer(conn, buffer, { hkdf, mediaPath, mediaKey = crypto.randomBytes(32) }) {
  const expanded = Buffer.from(
    crypto.hkdfSync('sha256', mediaKey, Buffer.alloc(32), Buffer.from(hkdf), 112)
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
      xmlns: 'w:m'
    },
    content: [{ tag: 'media_conn', attrs: {} }]
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
    fileEncSha256.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  )

  let lastError

  for (const host of hosts) {
    try {
      const json = await new Promise((resolve, reject) => {
        const url = new URL(
          `https://${host}${mediaPath}/${token}?auth=${encodeURIComponent(auth)}&token=${token}`
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
              'Content-Length': encBuffer.length
            }
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
          }
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
        ...json
      }
    } catch (e) {
      lastError = e
    }
  }

  throw lastError ?? new Error('Semua host upload gagal')
}

async function sendCustomStickerPack(conn, m, pack, meta) {
  const zip = new JSZip()
  const stickersMetadata = []

  for (const item of pack) {
    const fileName = `${toB64Url(sha256(item.buffer))}.${item.ext}`

    zip.file(fileName, item.buffer)

    stickersMetadata.push({
      fileName,
      isAnimated: item.isAnimated,
      emojis: [''],
      accessibilityLabel: '',
      isLottie: item.isLottie,
      mimetype: item.mimetype
    })
  }

  const trayIconFileName = 'tray_icon.webp'
  const traySource = pack.find(v => !v.isLottie)?.buffer

  const trayBuffer = traySource
    ? await makeTrayWebp(traySource)
    : await makeBlankTrayWebp()

  zip.file(trayIconFileName, trayBuffer)

  const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' })

  const packUpload = await uploadToServer(conn, archive, {
    hkdf: 'WhatsApp Sticker Pack Keys',
    mediaPath: '/mms/sticker-pack'
  })

  const thumbnailBuffer = await makeThumbnailJpeg(trayBuffer)

  const thumbUpload = await uploadToServer(conn, thumbnailBuffer, {
    hkdf: 'WhatsApp Sticker Pack Thumbnail Keys',
    mediaPath: '/mms/thumbnail-sticker-pack',
    mediaKey: packUpload.mediaKey
  })

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        messageSecret: crypto.randomBytes(32)
      },
      stickerPackMessage: {
        stickerPackId: 'Pack_' + crypto.randomBytes(8).toString('hex'),
        name: meta.name,
        publisher: meta.publisher,
        packDescription: meta.description,

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
        imageDataHash: thumbUpload.fileSha256.toString('base64')
      }
    },
    {
      quoted: m
    }
  )
}

async function sendStickerPack(conn, m, stickers, meta) {
  const all = stickers.slice(0, 120)
  const size = 30
  const chunks = []

  for (let i = 0; i < all.length; i += size) {
    chunks.push(all.slice(i, i + size))
  }

  for (const chunk of chunks) {
    const pack = []

    for (const item of chunk) {
      try {
        const { data } = await axios.get(item.url, {
          responseType: 'arraybuffer',
          timeout: 20000
        })

        const raw = Buffer.from(data)

        const normalized = item.is_video
          ? await normalizeVideoSticker(raw)
          : await normalizeSticker(raw)

        pack.push(normalized)
      } catch (e) {
        console.log('Sticker Fetch Error:', e.message)
      }
    }

    if (!pack.length) continue

    await sendCustomStickerPack(conn, m, pack, meta)

    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `Masukkan URL!\nContoh:\n${command} https://t.me/addstickers/xxxx`

  try {
    const res = await telestick(text)

    await m.reply(`✨ Mengambil pack...\n*${res.title}*`)

    if (!res.stickers.length) throw 'Gagal ambil sticker.'

    await sendStickerPack(conn, m, res.stickers, {
      name: `✨ ${res.title}`,
      publisher: 'Hilman',
      description: 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ'
    })

  } catch (e) {
    console.log(e)
    m.reply(typeof e === 'string' ? e : 'Gagal ambil sticker.')
  }
}

handler.help = ['telestick']
handler.tags = ['sticker']
handler.command = /^telestick$/i
handler.limit = true
handler.premium = false

export default handler
