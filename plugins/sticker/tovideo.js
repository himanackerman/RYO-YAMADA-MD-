import pkg from 'node-webpmux'
const { Image } = pkg
import { spawn } from 'child_process'
import { promises as fsp } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR = path.join(__dirname, '../../tmp')

async function webpToMp4(buffer) {
  const img = new Image()
  await img.load(buffer)
  await img.initLib()

  const width = img.width
  const height = img.height

  if (!img.hasAnim || !img.frames || img.frames.length === 0) {
    throw new Error('Sticker ini bukan animasi (cuma 1 frame), nggak perlu di-convert ke video')
  }

  const frameBuffers = []
  let totalDelay = 0

  for (let i = 0; i < img.frames.length; i++) {
    const frameInfo = img.frames[i]
    const raw = Buffer.from(await img.getFrameData(i))

    const canvas = Buffer.alloc(width * height * 4, 0)
    const fw = frameInfo.width
    const fh = frameInfo.height
    const fx = frameInfo.x || 0
    const fy = frameInfo.y || 0

    for (let row = 0; row < fh; row++) {
      const srcStart = row * fw * 4
      const destStart = ((fy + row) * width + fx) * 4
      raw.copy(canvas, destStart, srcStart, srcStart + fw * 4)
    }

    frameBuffers.push(canvas)
    totalDelay += (frameInfo.delay || 100)
  }

  const avgDelay = totalDelay / img.frames.length
  const fps = Math.max(1, Math.round(1000 / avgDelay))

  await fsp.mkdir(TMP_DIR, { recursive: true }).catch(() => {})

  const id = Date.now()
  const rawPath = path.join(TMP_DIR, `${id}.rgba`)
  const outPath = path.join(TMP_DIR, `${id}_out.mp4`)

  await fsp.writeFile(rawPath, Buffer.concat(frameBuffers))

  try {
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-y',
        '-f', 'rawvideo',
        '-pix_fmt', 'rgba',
        '-s', `${width}x${height}`,
        '-r', String(fps),
        '-i', rawPath,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        outPath
      ])

      let stderr = ''

      ff.stderr.on('data', d => {
        stderr += d
      })

      ff.on('error', reject)

      ff.on('close', code => {
        code === 0
          ? resolve()
          : reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-300)}`))
      })
    })

    return await fsp.readFile(outPath)
  } finally {
    await fsp.unlink(rawPath).catch(() => {})
    await fsp.unlink(outPath).catch(() => {})
  }
}

let handler = async (m, { conn }) => {
  if (!m.quoted || m.quoted.mtype !== 'stickerMessage') {
    return m.reply('Reply ke sticker yang mau di-convert jadi video ya')
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    })

    const media = await m.quoted.download()

    if (!media) throw new Error('Gagal download sticker')

    const video = await webpToMp4(media)

    await conn.sendMessage(m.chat, {
      video,
      caption: '',
      gifPlayback: false
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })
  } catch (e) {
    console.error('tovideo error:', e)

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    m.reply('❌ Gagal convert sticker ke video: ' + (e.message || e))
  }
}

handler.help = ['tovideo']
handler.tags = ['sticker']
handler.command = /^(tovid(eo)?|tovid)$/i

export default handler