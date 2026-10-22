import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFileSync, existsSync, readFileSync, mkdirSync, mkdtempSync, rmSync } from 'fs'
import path from 'path'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { sticker } from '../../lib/sticker.js'

const execFileAsync = promisify(execFile)

const FONT_URL = 'https://cdn.jsdelivr.net/gh/Napoleon-Fibonacci/assets@main/font/impact.ttf'
const EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json'

const TMP_DIR = path.join(process.cwd(), 'tmp')
const FONT_PATH = path.join(TMP_DIR, 'impact.ttf')
const EMOJI_JSON_PATH = path.join(TMP_DIR, 'emoji-apple.json')

const THEMES = {
  black: { bg: '#000000', text: '#ffffff' },
  white: { bg: '#ffffff', text: '#000000' },
  green: { bg: '#8ace00', text: '#000000' }
}

function ensureTmpDir() {
  if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR, { recursive: true })
  }
}

async function downloadFile(url, dest) {
  ensureTmpDir()
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
  return buf
}

async function ensureFont() {
  if (!existsSync(FONT_PATH)) await downloadFile(FONT_URL, FONT_PATH)
  GlobalFonts.registerFromPath(FONT_PATH, 'Impact')
}

let emojiMap = null
const emojiImageCache = new Map()

function emojiToUnicode(emoji) {
  return [...emoji].map(c => c.codePointAt(0).toString(16).padStart(4, '0')).join('-')
}

async function loadEmojiMap() {
  if (emojiMap) return emojiMap
  if (!existsSync(EMOJI_JSON_PATH)) await downloadFile(EMOJI_JSON_URL, EMOJI_JSON_PATH)
  emojiMap = JSON.parse(readFileSync(EMOJI_JSON_PATH, 'utf-8'))
  return emojiMap
}

async function getEmojiImage(emoji) {
  if (emojiImageCache.has(emoji)) return emojiImageCache.get(emoji)
  const map = await loadEmojiMap()
  const base = emojiToUnicode(emoji)
  const variants = [
    base,
    base.replace(/-fe0f/gi, ''),
    `${base.replace(/-fe0f/gi, '')}-fe0f`,
    base.toUpperCase(),
    base.replace(/-fe0f/gi, '').toUpperCase(),
    base.replace(/-fe0f/gi, '').toUpperCase() + '-FE0F'
  ]
  let b64 = null
  for (const v of variants) {
    if (map[v]) { b64 = map[v]; break }
  }
  if (!b64) return null
  const img = await loadImage(Buffer.from(b64, 'base64'))
  emojiImageCache.set(emoji, img)
  return img
}

async function drawAppleEmoji(ctx, emoji, x, y, size) {
  const img = await getEmojiImage(emoji)
  if (!img) { ctx.fillText(emoji, x, y); return }
  ctx.drawImage(img, x, y, size, size)
}

const EMOJI_REGEX = /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?|\p{Emoji}\uFE0F|[\u{1F1E0}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)/gu

function measureTextCustom(ctx, text, fontSize) {
  const parts = text.split(EMOJI_REGEX)
  let w = 0
  for (const part of parts) {
    if (!part) continue
    EMOJI_REGEX.lastIndex = 0
    if (EMOJI_REGEX.test(part)) w += fontSize
    else w += ctx.measureText(part).width
    EMOJI_REGEX.lastIndex = 0
  }
  return w
}

async function drawTextWithEmojis(ctx, text, x, y, fontSize) {
  const parts = text.split(EMOJI_REGEX)
  let curX = x
  for (const part of parts) {
    if (!part) continue
    EMOJI_REGEX.lastIndex = 0
    if (EMOJI_REGEX.test(part)) {
      await drawAppleEmoji(ctx, part, curX, y, fontSize)
      curX += fontSize
    } else {
      ctx.fillText(part, curX, y)
      ctx.measureText(part)
      curX += ctx.measureText(part).width
    }
    EMOJI_REGEX.lastIndex = 0
  }
}

function wrapText(ctx, text, maxWidth, fontSize) {
  ctx.font = `${fontSize}px Impact`
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word
    if (measureTextCustom(ctx, test, fontSize) > maxWidth && cur) {
      lines.push(cur)
      cur = word
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function fitsAt(ctx, text, fontSize, maxWidth, maxHeight, lineGap) {
  const lines = wrapText(ctx, text, maxWidth, fontSize)
  const longestWord = Math.max(...text.split(' ').map(w => measureTextCustom(ctx, w, fontSize)))
  const totalHeight = lines.length * (fontSize + lineGap) - lineGap
  return longestWord <= maxWidth && totalHeight <= maxHeight
}

function findBestFontSize(ctx, text, maxWidth, maxHeight, lineGap) {
  let lo = 10
  let hi = 700
  let best = lo

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (fitsAt(ctx, text, mid, maxWidth, maxHeight, lineGap)) {
      best = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return best
}

function easeOutBack(x) {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

function calculateWordLayout(ctx, fullText, maxWidth, maxHeight, lineGap, margin, padding, boxSize) {
  const fontSize = findBestFontSize(ctx, fullText, maxWidth, maxHeight, lineGap)
  ctx.font = `${fontSize}px Impact`
  const defaultSpaceWidth = ctx.measureText(' ').width

  const fullLines = wrapText(ctx, fullText, maxWidth, fontSize)
  const totalTextHeight = fullLines.length * (fontSize + lineGap) - lineGap
  const startY = margin + (boxSize - totalTextHeight) / 2

  const wordLayouts = []
  let currentY = startY

  for (let l = 0; l < fullLines.length; l++) {
    const line = fullLines[l]
    const lineWords = line.split(' ').filter(Boolean)
    const isLastLine = (l === fullLines.length - 1)

    const totalWordsW = lineWords.reduce((acc, w) => acc + measureTextCustom(ctx, w, fontSize), 0)

    let spaceBetween = defaultSpaceWidth
    if (!isLastLine && lineWords.length > 1) {
      spaceBetween = (maxWidth - totalWordsW) / (lineWords.length - 1)
    }

    let currentX = margin + padding

    for (const word of lineWords) {
      const wordW = measureTextCustom(ctx, word, fontSize)
      wordLayouts.push({
        text: word,
        x: currentX,
        y: currentY,
        w: wordW,
        h: fontSize
      })
      currentX += wordW + spaceBetween
    }
    currentY += fontSize + lineGap
  }

  return { fontSize, wordLayouts }
}

async function renderCanvas({
  wordLayouts,
  fontSize,
  wordStates,
  theme,
  blurAmount,
  highlightProgress = 0,
  format = 'mp4',
  margin = 70
}) {
  const selectedTheme = THEMES[theme] || THEMES.white
  const size = 1000
  const boxSize = size - margin * 2
  const x = margin
  const y = margin
  const w = boxSize
  const h = boxSize

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  if (format !== 'gif') {
    ctx.fillStyle = selectedTheme.bg
    ctx.fillRect(0, 0, size, size)
  } else {
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = selectedTheme.bg
    ctx.fillRect(x, y, w, h)
  }

  if (!wordLayouts || wordLayouts.length === 0) return canvas

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  ctx.fillStyle = selectedTheme.text
  ctx.font = `${fontSize}px Impact`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  if (blurAmount > 0) ctx.filter = `blur(${blurAmount}px)`

  for (let idx = 0; idx < wordLayouts.length; idx++) {
    const item = wordLayouts[idx]
    const state = wordStates[idx] || { scale: 0, alpha: 0, visible: false }

    if (!state.visible) continue

    const centerX = item.x + item.w / 2
    const centerY = item.y + fontSize / 2

    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, state.alpha))

    if (state.scale !== 1.0) {
      ctx.translate(centerX, centerY)
      ctx.scale(state.scale, state.scale)
      ctx.translate(-centerX, -centerY)
    }

    await drawTextWithEmojis(ctx, item.text, item.x, item.y, fontSize)
    ctx.restore()
  }

  if (highlightProgress > 0 && highlightProgress <= 1) {
    const totalDist = boxSize * 2.8
    const curr = margin - boxSize * 1.0 + highlightProgress * totalDist
    const sweepW = boxSize * 0.95

    const grad = ctx.createLinearGradient(curr, curr, curr + sweepW, curr + sweepW)

    grad.addColorStop(0.00, 'rgba(255, 255, 255, 0)')
    grad.addColorStop(0.10, 'rgba(255, 255, 255, 0.35)')
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.95)')
    grad.addColorStop(0.38, 'rgba(255, 255, 255, 0.35)')

    grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.05)')
    grad.addColorStop(0.52, 'rgba(255, 255, 255, 0.05)')

    grad.addColorStop(0.60, 'rgba(255, 255, 255, 0.35)')
    grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.95)')
    grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.35)')
    grad.addColorStop(1.00, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = grad
    ctx.fillRect(margin, margin, boxSize, boxSize)
  }

  ctx.restore()

  return canvas
}

async function generateBratVideo({
  text = 'Halo Guys',
  theme = 'white',
  blur = 0,
  format = 'mp4',
  holdDuration = 1.5,
  fastProgress = true
} = {}) {
  const blurAmount = [0, 1, 2, 3].includes(blur) ? blur : 0

  ensureTmpDir()
  await ensureFont()
  await loadEmojiMap()

  if (!text.trim()) throw new Error('Teks kosong')

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'brat-'))

  const FPS = 60
  const frameStepTime = 1 / FPS
  const tasks = []

  const size = 1000
  const margin = 70
  const padding = 40
  const boxSize = size - margin * 2
  const lineGap = 15
  const maxWidth = boxSize - padding * 2
  const maxHeight = boxSize - padding * 2

  const dummyCanvas = createCanvas(size, size)
  const dummyCtx = dummyCanvas.getContext('2d')

  const { fontSize, wordLayouts } = calculateWordLayout(
    dummyCtx, text, maxWidth, maxHeight, lineGap, margin, padding, boxSize
  )

  const totalWords = wordLayouts.length

  tasks.push({
    wordStates: wordLayouts.map(() => ({ scale: 0, alpha: 0, visible: false })),
    highlightProgress: 0,
    duration: 0.15
  })

  const staggerFrames = 5
  const bounceFramesCount = 28
  const totalBounceFrames = (totalWords - 1) * staggerFrames + bounceFramesCount

  for (let f = 0; f < totalBounceFrames; f++) {
    const wordStates = wordLayouts.map((_, i) => {
      const startFrame = i * staggerFrames
      const currentFrame = f - startFrame

      if (currentFrame < 0) {
        return { scale: 0, alpha: 0, visible: false }
      } else if (currentFrame >= bounceFramesCount) {
        return { scale: 1.0, alpha: 1.0, visible: true }
      } else {
        const prog = currentFrame / (bounceFramesCount - 1)
        const bounceFactor = easeOutBack(prog)
        const scale = 0.2 + (1.0 - 0.2) * bounceFactor
        const alpha = Math.min(1.0, prog * 1.8)
        return { scale, alpha, visible: true }
      }
    })

    const highlightProgress = (f + 1) / totalBounceFrames

    tasks.push({
      wordStates,
      highlightProgress,
      duration: frameStepTime
    })
  }

  const secondHighlightFrames = 38
  const allVisibleStates = wordLayouts.map(() => ({ scale: 1.0, alpha: 1.0, visible: true }))

  for (let hf = 0; hf < secondHighlightFrames; hf++) {
    const highlightProgress = (hf + 1) / secondHighlightFrames
    tasks.push({
      wordStates: allVisibleStates,
      highlightProgress,
      duration: frameStepTime
    })
  }

  tasks.push({
    wordStates: allVisibleStates,
    highlightProgress: 0,
    duration: holdDuration
  })

  const renderFrame = async (task, index) => {
    const canvas = await renderCanvas({
      wordLayouts,
      fontSize,
      wordStates: task.wordStates,
      theme,
      blurAmount,
      highlightProgress: task.highlightProgress,
      format,
      margin
    })
    const buffer = await canvas.encode('png')
    const framePath = path.join(tmpDir, `frame-${String(index + 1).padStart(5, '0')}.png`)
    writeFileSync(framePath, buffer)
    return { path: framePath, duration: task.duration }
  }

  let framePaths
  if (fastProgress) {
    framePaths = await Promise.all(tasks.map((task, i) => renderFrame(task, i)))
  } else {
    framePaths = []
    for (let i = 0; i < tasks.length; i++) {
      framePaths.push(await renderFrame(tasks[i], i))
    }
  }

  const manifestLines = []
  for (let i = 0; i < framePaths.length; i++) {
    manifestLines.push(`file '${framePaths[i].path.replace(/'/g, "'\\''")}'`)
    manifestLines.push(`duration ${framePaths[i].duration}`)
  }
  manifestLines.push(`file '${framePaths[framePaths.length - 1].path.replace(/'/g, "'\\''")}'`)

  const concatPath = path.join(tmpDir, 'concat.txt')
  writeFileSync(concatPath, manifestLines.join('\n'))

  const ext = format === 'gif' ? 'gif' : 'mp4'
  const outPath = path.join(tmpDir, `output.${ext}`)

  if (format === 'gif') {
    await execFileAsync('ffmpeg', [
      '-y',
      '-f', 'concat', '-safe', '0', '-i', concatPath,
      '-vf', 'fps=60,scale=1000:1000:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer',
      '-loop', '0',
      outPath
    ])
  } else {
    await execFileAsync('ffmpeg', [
      '-y',
      '-f', 'concat', '-safe', '0', '-i', concatPath,
      '-vf', 'fps=60,scale=1000:1000',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outPath
    ])
  }

  const resultBuffer = readFileSync(outPath)
  rmSync(tmpDir, { recursive: true, force: true })
  return resultBuffer
}

let handler = async (m, { conn, text, command }) => {
  try {
    await m.react('🕒')

    if (!text) {
      await m.react('❌')
      return m.reply('Masukkan teks yang ingin dijadikan stiker brat!\n\n*Contoh:* .bratvid2 Halo Guys')
    }

    const format = command === 'bratgif2' ? 'gif' : 'mp4'
    const buffer = await generateBratVideo({
      text: text,
      theme: 'white',
      format: format,
      holdDuration: 1.5,
      fastProgress: true
    })

    if (!buffer) throw 'Gagal membuat video brat!'

    let stiker = await sticker(buffer, false, global.packname || '', global.author || '')
    if (!stiker) {
      stiker = buffer
    }

    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
    await m.react('✨')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Gagal: ${e.message || e}`)
  }
}

handler.help = ['bratvid2', 'bratgif2']
handler.tags = ['sticker']
handler.command = /^(bratvid2|bratgif2)$/i

export default handler