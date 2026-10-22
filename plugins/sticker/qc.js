import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { sticker } from '../../lib/sticker.js'

const FONT_NAME_PATH = path.join(process.cwd(), 'src', 'font', 'Roboto-Bold.ttf')
const FONT_TEXT_PATH = path.join(process.cwd(), 'src', 'font', 'Roboto-Medium.ttf')

let nameFont = 'Arial'
let textFont = 'Arial'

if (fs.existsSync(FONT_NAME_PATH)) {
  GlobalFonts.registerFromPath(FONT_NAME_PATH, 'QcNameFont')
  nameFont = 'QcNameFont'
}

if (fs.existsSync(FONT_TEXT_PATH)) {
  GlobalFonts.registerFromPath(FONT_TEXT_PATH, 'QcTextFont')
  textFont = 'QcTextFont'
}

const EMOJI_CACHE = path.join(process.cwd(), 'tmp', 'emoji-cache')
if (!fs.existsSync(EMOJI_CACHE)) fs.mkdirSync(EMOJI_CACHE, { recursive: true })

function emojiToFilename(emoji) {
  return [...emoji]
    .map(char => char.codePointAt(0))
    .filter(codePoint => codePoint !== 0xfe0f)
    .map(codePoint => codePoint.toString(16))
    .join('-') + '.png'
}

async function getEmojiPath(emoji) {
  const fileName = emojiToFilename(emoji)
  const localPath = path.join(EMOJI_CACHE, fileName)

  if (fs.existsSync(localPath)) return localPath

  try {
    const response = await axios.get(
      `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${fileName}`,
      { responseType: 'arraybuffer', timeout: 5000 }
    )
    fs.writeFileSync(localPath, Buffer.from(response.data))
    return localPath
  } catch (_) {
    return null
  }
}

function toSegments(text) {
  const emojiRe = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
  const parts = []
  let last = 0

  for (const match of text.matchAll(emojiRe)) {
    if (match.index > last) parts.push({ t: 'text', v: text.slice(last, match.index) })
    parts.push({ t: 'emoji', v: match[0] })
    last = match.index + match[0].length
  }

  if (last < text.length) parts.push({ t: 'text', v: text.slice(last) })

  return parts
}

function segWidth(ctx, seg, size) {
  return seg.t === 'text' ? ctx.measureText(seg.v).width : size * 1.15
}

const COLOR_MAP = {
  'putih': '#FFFFFF',
  'hijau': '#00FF00',
  'kuning': '#FFFF00',
  'hitam': '#000000',
  'merah': '#FF0000',
  'biru': '#0000FF',
  'ungu': '#800080',
  'jingga': '#FFA500',
  'pink': '#FFC0CB',
  'abu-abu': '#808080',
  'coklat': '#A52A2A',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'maroon': '#800000',
  'navy': '#000080',
  'olive': '#808000',
  'orange': '#FFA500',
  'purple': '#800080',
  'silver': '#C0C0C0',
  'teal': '#008080',
  'turquoise': '#40E0D0',
  'violet': '#EE82EE',
  'salmon': '#FA8072',
  'gold': '#FFD700',
  'indigo': '#4B0082',
  'lime': '#00FF00',
  'skyblue': '#87CEEB',
  'tan': '#D2B48C',
  'orchid': '#DA70D6',
  'coral': '#FF7F50'
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''
  let isMedia = /image|sticker/.test(mime)

  let rawText = m.quoted ? (q.text || text || '') : text
  rawText = rawText ? rawText.trim() : ''

  const availableColors = Object.keys(COLOR_MAP).join(', ')
  const helpMsg = `❌ *Cara Penggunaan:*
• ${usedPrefix + command} <teks>
• ${usedPrefix + command} [warna] <teks>
• Reply gambar/stiker dengan *${usedPrefix + command}*

🎨 *Daftar Warna:*
${availableColors}`

  if (!rawText && !isMedia) throw helpMsg

  let bubbleColor = '#FFFFFF'
  let textColor = '#111111'
  let quoteText = rawText

  let words = rawText.split(/\s+/)
  let detectedColor = null

  words = words.filter(word => {
    let cleanWord = word.toLowerCase().replace(/^--?/, '')
    if (COLOR_MAP[cleanWord] && !detectedColor) {
      detectedColor = cleanWord
      return false
    }
    return true
  })

  quoteText = words.join(' ') || (m.quoted && !isMedia ? q.text : '')

  if (detectedColor) {
    bubbleColor = COLOR_MAP[detectedColor]
    if (['hitam', 'navy', 'maroon', 'indigo', 'purple', 'ungu', 'coklat', 'teal'].includes(detectedColor)) {
      textColor = '#FFFFFF'
    }
  }

  if (!quoteText && !isMedia) throw helpMsg

  await m.react('🕒')

  let mediaImg = null
  if (isMedia) {
    try {
      let mediaBuffer = await q.download()
      if (mediaBuffer) mediaImg = await loadImage(mediaBuffer)
    } catch (_) {}
  }

  let sender = q.sender || m.sender
  let name = await conn.getName(sender) || 'User'

  const defaultAvatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'

  let avatar
  try {
    let ppUrl = await conn.profilePictureUrl(sender, 'image')
    avatar = await loadImage(ppUrl)
  } catch {
    avatar = await loadImage(defaultAvatarUrl)
  }

  const canvas = createCanvas(512, 512)
  const ctx = canvas.getContext('2d')

  const fontSize = 32
  ctx.font = `32px ${textFont}`

  let lineSegmentsList = []
  if (quoteText) {
    const rawWords = quoteText.split(' ')
    const lines = []
    let currentLine = rawWords[0]

    for (let i = 1; i < rawWords.length; i++) {
      const testLine = currentLine + ' ' + rawWords[i]
      const testSegments = toSegments(testLine)
      const testWidth = testSegments.reduce((sum, seg) => sum + segWidth(ctx, seg, fontSize), 0)

      if (testWidth > 280) {
        lines.push(currentLine)
        currentLine = rawWords[i]
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)
    lineSegmentsList = lines.map(line => toSegments(line))
  }

  const allEmojis = new Set()
  for (const segs of lineSegmentsList) {
    for (const seg of segs) {
      if (seg.t === 'emoji') allEmojis.add(seg.v)
    }
  }

  const emojiPathMap = {}
  await Promise.all(
    [...allEmojis].map(async emoji => {
      emojiPathMap[emoji] = await getEmojiPath(emoji)
    })
  )

  ctx.font = `bold 34px ${nameFont}`
  let nameWidth = ctx.measureText(name).width

  ctx.font = `32px ${textFont}`
  let maxTextWidth = 0
  for (const segs of lineSegmentsList) {
    let w = segs.reduce((sum, seg) => sum + segWidth(ctx, seg, fontSize), 0)
    if (w > maxTextWidth) maxTextWidth = w
  }

  let mediaWidth = 0
  let mediaHeight = 0
  if (mediaImg) {
    let maxMediaDim = 220
    let aspect = mediaImg.width / mediaImg.height
    if (aspect > 1) {
      mediaWidth = maxMediaDim
      mediaHeight = maxMediaDim / aspect
    } else {
      mediaHeight = maxMediaDim
      mediaWidth = maxMediaDim * aspect
    }
  }

  let avatarSize = 90
  let contentWidth = Math.max(nameWidth, maxTextWidth, mediaWidth)
  let bubbleWidth = Math.min(Math.max(contentWidth + 50, 260), 370)

  let textBlockHeight = lineSegmentsList.length * 38
  let mediaBlockHeight = mediaImg ? mediaHeight + 15 : 0
  let bubbleHeight = 55 + textBlockHeight + mediaBlockHeight + 20

  let totalWidth = avatarSize + 15 + bubbleWidth
  let startX = Math.max((512 - totalWidth) / 2, 10)
  let avatarX = startX
  let bubbleX = avatarX + avatarSize + 15
  let startY = (512 - bubbleHeight) / 2

  ctx.save()
  ctx.beginPath()
  ctx.arc(avatarX + (avatarSize / 2), startY + (avatarSize / 2), avatarSize / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(avatar, avatarX, startY, avatarSize, avatarSize)
  ctx.restore()

  ctx.fillStyle = bubbleColor
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = 6
  drawRoundedRect(ctx, bubbleX, startY, bubbleWidth, bubbleHeight, 24)
  ctx.fill()

  ctx.shadowColor = 'transparent'

  ctx.font = `bold 34px ${nameFont}`
  ctx.fillStyle = '#E57D22'
  ctx.fillText(name, bubbleX + 25, startY + 45)

  ctx.font = `32px ${textFont}`
  ctx.textBaseline = 'top'
  let textY = startY + 68

  for (const segs of lineSegmentsList) {
    let currentX = bubbleX + 25
    for (const seg of segs) {
      if (seg.t === 'text') {
        ctx.fillStyle = textColor
        ctx.fillText(seg.v, currentX, textY)
        currentX += ctx.measureText(seg.v).width
      } else {
        const emojiPath = emojiPathMap[seg.v]
        if (emojiPath && fs.existsSync(emojiPath)) {
          try {
            const image = await loadImage(emojiPath)
            ctx.drawImage(image, currentX, textY + 2, fontSize, fontSize)
          } catch (_) {}
        }
        currentX += fontSize * 1.15
      }
    }
    textY += 38
  }

  if (mediaImg) {
    let mediaX = bubbleX + 25
    let mediaY = lineSegmentsList.length > 0 ? textY + 10 : startY + 68

    ctx.save()
    drawRoundedRect(ctx, mediaX, mediaY, mediaWidth, mediaHeight, 12)
    ctx.clip()
    ctx.drawImage(mediaImg, mediaX, mediaY, mediaWidth, mediaHeight)
    ctx.restore()
  }

  const buffer = canvas.toBuffer('image/png')
  const packname = global.stickpack || 'Elaina - MD'
  const author = global.stickauth || 'Hilman'

  const stiker = await sticker(buffer, null, packname, author, false)

  await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
  await m.react('✨')
}

handler.help = ['qc']
handler.tags = ['sticker']
handler.command = /^qc$/i

export default handler
