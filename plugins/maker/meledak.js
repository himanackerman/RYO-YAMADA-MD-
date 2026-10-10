/**
 *  canvas meledak
 * -----------------------------
 * type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 */

import { createCanvas, loadImage } from '@napi-rs/canvas'

const BACKGROUND_URL = 'https://raw.githubusercontent.com/himanackerman/Image/refs/heads/main/anu/10a1fe0d21270e01da6efa113c26203b.jpg'

export async function removeBgNet(buffer) {
  const blob = new Blob([buffer], { type: 'image/png' })
  const form = new FormData()
  form.append('image', blob, 'image.png')
  form.append('format', 'png')
  form.append('model', 'v1')

  const res = await fetch('https://api2.pixelcut.app/image/matte/v1', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'x-client-version': 'web:pixa.com:4a5b0af2'
    },
    body: form
  })

  if (!res.ok) throw new Error(`Status ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''
  let isMedia = /image|sticker/.test(mime)

  if (!isMedia) {
    throw `❌ *Cara Penggunaan:*\nKirim atau reply gambar/stiker dengan *${usedPrefix + command}*`
  }

  await m.react('🕒')

  let mediaBuffer
  try {
    mediaBuffer = await q.download()
  } catch (_) {}

  if (!mediaBuffer) throw 'Gagal mengunduh gambar/stiker.'

  let transparentBuffer
  try {
    transparentBuffer = await removeBgNet(mediaBuffer)
  } catch (err) {
    transparentBuffer = mediaBuffer
  }

  let targetImg = await loadImage(transparentBuffer)
  let bgImg
  try {
    bgImg = await loadImage(BACKGROUND_URL)
  } catch (e) {
    throw 'Gagal memuat mentahan background.'
  }

  const canvasWidth = bgImg.width
  const canvasHeight = bgImg.height

  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight)

  let scale
  const isPortrait = targetImg.height > targetImg.width

  if (isPortrait) {
    scale = canvasHeight / targetImg.height
  } else {
    scale = (canvasWidth * 0.75) / targetImg.width
  }

  let fgWidth = targetImg.width * scale
  let fgHeight = targetImg.height * scale

  if (fgWidth > canvasWidth * 0.85) {
    scale = (canvasWidth * 0.85) / targetImg.width
    fgWidth = targetImg.width * scale
    fgHeight = targetImg.height * scale
  }

  let fgX = canvasWidth - fgWidth
  let fgY = canvasHeight - fgHeight

  ctx.drawImage(targetImg, fgX, fgY, fgWidth, fgHeight)

  const buffer = canvas.toBuffer('image/png')

  await conn.sendMessage(
    m.chat,
    { image: buffer },
    { quoted: m }
  )
  await m.react('💥')
}

handler.help = ['meledak']
handler.tags = ['maker']
handler.command = /^(meledak)$/i

export default handler