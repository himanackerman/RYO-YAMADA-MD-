/**
NOTE:JANGAN HAPUS WM HARGAIN DEV
DEV:RIKI
SLURAN:https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I
sesuai in sama bot mu
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import dns from 'dns'
import { spawn, execFile } from 'child_process'
import { promisify } from 'util'

/* ── FIX IPv6 (pola storyedit): penyebab umum "fetch failed" di VPS/panel ── */
try { dns.setDefaultResultOrder?.('ipv4first') } catch { }

const runF = promisify(execFile)

/* ════════════════════════════════════════════════════════════
 *  KONFIG
 * ════════════════════════════════════════════════════════════ */

const CFG = {
  dirTmp: './tmp/typogaleri',
  fontDir: './tmp/typogaleri/fonts',
  duration: 15,          // durasi output utk input FOTO (detik)
  maxDur: 15,            // durasi maks output utk input VIDEO
  minDur: 3,             // durasi min output
  fps: 30,
  dlTimeout: 120000,     // timeout per percobaan unduh media
  dlRetry: 3,            // percobaan unduh media
  sendRetry: 3,          // percobaan kirim video
  maxKeep: 15            // max file video lama di tmp
}

const CAPTIONS = ['you are the sky', 'you are art', 'you are everything']

const FONT_LIST = [
  ['Poppins-Regular.ttf', 'Pop', 'ofl/poppins/Poppins-Regular.ttf'],
  ['Poppins-Medium.ttf', 'PopM', 'ofl/poppins/Poppins-Medium.ttf'],
  ['Poppins-SemiBold.ttf', 'PopSB', 'ofl/poppins/Poppins-SemiBold.ttf'],
  ['Poppins-Bold.ttf', 'PopB', 'ofl/poppins/Poppins-Bold.ttf'],
  ['GreatVibes-Regular.ttf', 'Vibes', 'ofl/greatvibes/GreatVibes-Regular.ttf'],
  ['Anton-Regular.ttf', 'Anton', 'ofl/anton/Anton-Regular.ttf']
]

/* Tema TIDAK diracik acak — judul & tempat murni dari input user.
   Default netral hanya dipakai bila user tidak memberi argumen. */
const DEFAULT_JUDUL = 'Galeri'
const DEFAULT_TEMPAT = 'Indonesia'

const cap = s => String(s).replace(/\b\w/g, c => c.toUpperCase())

/* ════════════════════════════════════════════════════════════
 *  UTIL DASAR
 * ════════════════════════════════════════════════════════════ */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const clamp01 = t => clamp(t, 0, 1)
const easeOut = t => 1 - Math.pow(1 - clamp01(t), 3)
const easeInOut = t => { t = clamp01(t); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 }
const easeBack = t => { t = clamp01(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) }
const win = (t, a, b) => clamp01((t - a) / (b - a))
const TAU = Math.PI * 2
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchBin(url, timeoutMs = 45000) {
  const ac = new AbortController()
  const to = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ac.signal, headers: { 'User-Agent': 'Mozilla/5.0', Origin: 'https://web.whatsapp.com' } })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return Buffer.from(await res.arrayBuffer())
  } finally { clearTimeout(to) }
}

/** bongkar penyebab asli error (undici menyembunyikannya di e.cause) — pola storyedit */
const errWhy = (e) => {
  if (!e) return 'unknown'
  const cause = e.cause || e.error
  const parts = [e.shortMessage || e.message || String(e)]
  const code = cause?.code || cause?.errno
  if (code) parts.push(`(${code})`)
  const st = e.statusCode || e.status || cause?.statusCode
  if (st) parts.push(`[${st}]`)
  const cm = cause?.message && cause.message !== parts[0] ? cause.message : ''
  if (cm) parts.push('→ ' + cm)
  return parts.join(' ')
}

const withTimeout = (p, ms, label) => Promise.race([
  Promise.resolve(p),
  new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${Math.round(ms / 1000)}s`)), ms)),
])

/* ════════════════════════════════════════════════════════════
 *  FFMPEG (sistem dulu, lalu ffmpeg-static)
 * ════════════════════════════════════════════════════════════ */

let FF_BIN = null

async function findFfmpeg() {
  if (FF_BIN) return FF_BIN
  const cands = [process.env.FFMPEG_BIN, 'ffmpeg']
  try { cands.push((await import('ffmpeg-static')).default) } catch { }
  for (const bin of cands.filter(Boolean)) {
    const ok = await new Promise(res => {
      const p = spawn(bin, ['-version'], { stdio: 'ignore' })
      p.on('error', () => res(false))
      p.on('close', c => res(c === 0))
    })
    if (ok) { FF_BIN = bin; return FF_BIN }
  }
  throw new Error('ffmpeg tidak ditemukan. Install: apt install ffmpeg -y  (atau: npm install ffmpeg-static)')
}

function runFF(args) {
  return new Promise(async (resolve, reject) => {
    const bin = await findFfmpeg()
    const proc = spawn(bin, ['-hide_banner', '-loglevel', 'error', '-nostats', '-y', ...args], { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    proc.stderr.on('data', d => { stderr += d.toString(); if (stderr.length > 6000) stderr = stderr.slice(-3000) })
    proc.on('error', reject)
    proc.on('close', code => code === 0
      ? resolve()
      : reject(new Error(`ffmpeg exit ${code}\n${stderr.slice(-1200)}`)))
  })
}

/** info video: durasi + ada audio tidak (parse output ffmpeg -i) */
async function probeMedia(file) {
  let info = ''
  try {
    const bin = await findFfmpeg()
    info = await new Promise((resolve, reject) => {
      const p = spawn(bin, ['-hide_banner', '-i', file], { stdio: ['ignore', 'ignore', 'pipe'] })
      let err = ''
      p.stderr.on('data', d => { err += d.toString() })
      p.on('error', reject)
      p.on('close', () => resolve(err))
    })
  } catch { }
  let dur = CFG.duration
  const m = info.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/)
  if (m) {
    const d = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3])
    if (isFinite(d) && d > 0) dur = d
  }
  if (dur === CFG.duration) {
    try {
      const probe = (await findFfmpeg()).replace(/ffmpeg[^/]*$/, 'ffprobe')
      const { stdout } = await runF(probe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { maxBuffer: 1 << 20 })
      const d = parseFloat(stdout)
      if (isFinite(d) && d > 0) dur = d
    } catch { }
  }
  const hasAudio = /Stream #\d+:\d+.*Audio:/.test(info)
  return { dur, hasAudio }
}

/** ambil 1 frame pada detik `at` — full frame (AR asli), lebar maks 900 */
async function grabStill(basePath, at, outPath) {
  const run = async (seekFirst) => {
    const bin = await findFfmpeg()
    const args = [
      ...(seekFirst ? ['-ss', at.toFixed(2)] : []), '-i', basePath,
      '-frames:v', '1', '-vf', "scale='min(900,iw)':-2", '-q:v', '3', outPath
    ]
    if (!seekFirst) args.unshift('-ss', at.toFixed(2))
    await runFF(args)
  }
  try {
    await run(true)
    if (!fs.existsSync(outPath) || fs.statSync(outPath).size < 500) throw new Error('still kosong')
  } catch { await run(false) }
  return outPath
}

/* ════════════════════════════════════════════════════════════
 *  BAILEYS AUTO-DETECT (package fork apa pun)
 * ════════════════════════════════════════════════════════════ */

let BAILEYS_MOD = null
async function getBaileys() {
  if (BAILEYS_MOD?.downloadContentFromMessage) return BAILEYS_MOD
  const candidates = ['@itsliaaa/baileys', '@whiskeysockets/baileys', '@nazedev/baileys', '@neoxr/baileys', '@adiwajshing/baileys', 'baileys']
  try {
    const pj = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    for (const name of Object.keys({ ...pj.dependencies, ...pj.devDependencies }))
      if (/baileys/i.test(name) && !candidates.includes(name)) candidates.unshift(name)
  } catch { }
  try {
    for (const d of fs.readdirSync('./node_modules')) {
      if (d.startsWith('@')) {
        try {
          for (const s of fs.readdirSync(`./node_modules/${d}`)) {
            const full = `${d}/${s}`
            if (/baileys/i.test(full) && !candidates.includes(full)) candidates.unshift(full)
          }
        } catch { }
      } else if (/baileys/i.test(d) && !candidates.includes(d)) candidates.unshift(d)
    }
  } catch { }
  for (const pkg of candidates) {
    try {
      const mod = await import(pkg)
      if (mod?.downloadContentFromMessage) { BAILEYS_MOD = mod; return BAILEYS_MOD }
    } catch { }
  }
  return BAILEYS_MOD || {}
}

/* ════════════════════════════════════════════════════════════
 *  SMART DOWNLOAD (pola storyedit) — anti "fetch failed"
 * ════════════════════════════════════════════════════════════ */

function pickMediaProto(obj) {
  if (!obj) return null
  const mt = String(obj.mtype || '').toLowerCase()
  const direct = obj.videoMessage || obj.imageMessage || obj.documentMessage
    || obj.message?.videoMessage || obj.message?.imageMessage || obj.message?.documentMessage
  if (direct) return direct
  if (mt === 'videomessage' || mt === 'imagemessage' || mt === 'documentmessage') {
    const msg = obj.msg?.videoMessage || obj.msg?.imageMessage || obj.msg?.documentMessage
      || obj.message?.videoMessage || obj.message?.imageMessage || obj.message?.documentMessage
      || ((obj.url || obj.mediaKey || obj.jpegThumbnail) ? obj : null)
    return msg || null
  }
  return null
}

let _waAgent = undefined
async function getWaAgent() {
  if (_waAgent !== undefined) return _waAgent
  try {
    const { Agent } = await import('undici')
    _waAgent = new Agent({ connect: { family: 4, timeout: 30000 }, headersTimeout: CFG.dlTimeout, bodyTimeout: CFG.dlTimeout })
  } catch { _waAgent = null }
  return _waAgent
}

async function smartDownload(node, conn, store, waType) {
  const errs = []
  // 1) jalur serializer bawaan (naze/christy: m.quoted.download()) + retry
  if (typeof node?.download === 'function') {
    for (let i = 1; i <= CFG.dlRetry; i++) {
      try {
        const buf = await withTimeout(Promise.resolve(node.download()), CFG.dlTimeout, 'unduh media')
        if (buf && buf.length > 0) return buf
        throw new Error('media kosong / URL media tidak tersedia')
      } catch (e) { errs.push(errWhy(e)); if (i < CFG.dlRetry) await sleep(1200 * i) }
    }
  }
  // 2) helper conn / store
  for (const [label, helper] of [['conn', conn?.downloadMediaMessage], ['store', store?.downloadMediaMessage]]) {
    if (typeof helper !== 'function') continue
    try {
      const buf = await withTimeout(Promise.resolve(helper(node)), CFG.dlTimeout, `unduh media (${label})`)
      if (buf && buf.length > 0) return buf
    } catch (e) { errs.push(errWhy(e)) }
  }

  const raw = pickMediaProto(node)
  if (!raw) throw new Error('media tidak bisa dibaca dari pesan' + (errs.length ? ' · ' + errs[0] : ''))

  // 3) downloadContentFromMessage (opsi undici agent IPv4 bila paket terpasang)
  const baid = await getBaileys()
  if (typeof baid?.downloadContentFromMessage === 'function') {
    const agent = await getWaAgent()
    for (let i = 1; i <= 2; i++) {
      try {
        const { Readable } = await import('node:stream')
        let stream = await Promise.resolve().then(() =>
          agent
            ? baid.downloadContentFromMessage(raw, waType, { options: { dispatcher: agent } })
            : baid.downloadContentFromMessage(raw, waType)
        )
        if (stream?.pipe || stream?.getReader) stream = Readable.from(stream)
        if (stream && typeof stream.on === 'function') {
          const buf = await new Promise((resolve, reject) => {
            const chunks = []
            stream.on('data', c => chunks.push(c))
            stream.on('end', () => resolve(Buffer.concat(chunks)))
            stream.on('error', reject)
          })
          if (buf.length > 0) return buf
        }
        throw new Error('stream kosong')
      } catch (e) { errs.push(errWhy(e)); if (i < 2) await sleep(1200) }
    }
  }

  // 4) unduh URL + dekripsi AES-256-CBC manual
  try {
    const { getMediaKeys, getUrlFromDirectPath } = baid
    const url = raw.url || (raw.directPath && getUrlFromDirectPath ? getUrlFromDirectPath(raw.directPath) : null)
    if (url && raw.mediaKey && typeof getMediaKeys === 'function') {
      for (let i = 1; i <= 2; i++) {
        try {
          const enc = await fetchBin(url, CFG.dlTimeout)
          const keys = await getMediaKeys(raw.mediaKey, waType)
          const d = crypto.createDecipheriv('aes-256-cbc', keys.cipherKey, keys.iv)
          const buf = Buffer.concat([d.update(enc), d.final()])
          if (buf.length > 0) return buf
          throw new Error('hasil dekripsi kosong')
        } catch (e) { errs.push(errWhy(e)); if (i < 2) await sleep(1200) }
      }
    } else if (url) {
      const buf = await fetchBin(url, CFG.dlTimeout)
      if (buf.length > 0) return buf
    }
  } catch (e) { errs.push(errWhy(e)) }

  throw new Error('semua metode unduh gagal → ' + errs.join(' | '))
}

/** kirim dengan retry (upload ke server WA juga memakai fetch) — pola storyedit */
async function sendWithRetry(fn, tries = CFG.sendRetry) {
  let lastErr = null
  for (let i = 1; i <= tries; i++) {
    try { return await fn() } catch (e) { lastErr = e; if (i < tries) await sleep(2000 * i) }
  }
  throw new Error('kirim/upload video gagal → ' + errWhy(lastErr))
}

/* ════════════════════════════════════════════════════════════
 *  CANVAS + FONT (lazy init, unduh otomatis sekali)
 * ════════════════════════════════════════════════════════════ */

let CV = null
let fontsReady = false

async function initCanvas() {
  if (!CV) {
    let mod
    try {
      mod = await import('@napi-rs/canvas')
    } catch {
      throw new Error('Package @napi-rs/canvas belum terpasang. Jalankan di folder bot:\nnpm install @napi-rs/canvas')
    }
    CV = { createCanvas: mod.createCanvas, loadImage: mod.loadImage, GlobalFonts: mod.GlobalFonts }
  }
  return CV
}

async function ensureFonts() {
  if (fontsReady || !CV) return
  fs.mkdirSync(CFG.fontDir, { recursive: true })
  for (const [file, alias, repo] of FONT_LIST) {
    const dest = path.join(CFG.fontDir, file)
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 10000) {
      const urls = [
        `https://raw.githubusercontent.com/google/fonts/main/${repo}`,
        `https://cdn.jsdelivr.net/gh/google/fonts@main/${repo}`
      ]
      let ok = false
      for (const u of urls) {
        try {
          const buf = await fetchBin(u, 45000)
          if (buf.length > 10000) { fs.writeFileSync(dest, buf); ok = true; break }
        } catch { }
      }
      if (!ok) console.error(`[typogaleri2] font ${file} gagal diunduh (dipakai font bawaan)`)
    }
    try { CV.GlobalFonts.registerFromPath(dest, alias) } catch { }
  }
  fontsReady = true
}

/* ════════════════════════════════════════════════════════════
 *  5 GAMBAR DARI INPUT
 *  - video → frame pada momen tetap 20/40/60/80/100%
 *  - foto  → 5 crop berbeda
 * ════════════════════════════════════════════════════════════ */

async function stillsFromVideo(videoPath, outDir, stamp) {
  const { dur } = await probeMedia(videoPath)
  const at = p => Math.max(0.1, Math.min(Math.max(0.1, dur - 0.25), dur * p / 100))
  const outs = []
  for (let i = 0; i < 5; i++) {
    outs.push(await grabStill(videoPath, at(20 * (i + 1)), path.join(outDir, `st_${stamp}_${i}.jpg`)))
  }
  return { photos: outs }
}

async function stillsFromPhoto(photoPath, outDir, stamp) {
  const { createCanvas, loadImage } = CV
  const img = await loadImage(photoPath)
  const zoom = 1.18
  const focusPts = [[.12, .18], [.88, .18], [.5, .5], [.12, .82], [.88, .82]]
  const outs = []
  for (let i = 0; i < 5; i++) {
    const c = createCanvas(900, 640)
    const x = c.getContext('2d')
    x.fillStyle = '#101010'
    x.fillRect(0, 0, 900, 640)
    const s = Math.max(900 / img.width, 640 / img.height) * zoom
    const dw = img.width * s, dh = img.height * s
    const dx = (900 - dw) * focusPts[i][0]
    const dy = (640 - dh) * focusPts[i][1]
    x.drawImage(img, dx, dy, dw, dh)
    const p = path.join(outDir, `st_${stamp}_${i}.jpg`)
    fs.writeFileSync(p, await c.encode('jpeg', 92))
    outs.push(p)
  }
  // latar: foto penuh (cover 1280x720)
  const bgc = createCanvas(1280, 720)
  const bx = bgc.getContext('2d')
  const s = Math.max(1280 / img.width, 720 / img.height) * 1.12
  const dw = img.width * s, dh = img.height * s
  bx.drawImage(img, (1280 - dw) / 2, (720 - dh) / 2, dw, dh)
  const bg = path.join(outDir, `bg_${stamp}.jpg`)
  fs.writeFileSync(bg, await bgc.encode('jpeg', 92))
  return { photos: outs, bg }
}

/* ════════════════════════════════════════════════════════════
 *  MUSIK AMBIENT (sintesis → AAC) — fallback bila tidak ada audio asli
 * ════════════════════════════════════════════════════════════ */

async function getAmbient(duration = CFG.duration) {
  const secs = Math.max(CFG.minDur, Math.round(duration))
  const out = path.join(CFG.dirTmp, `ambient_${secs}.m4a`)
  if (fs.existsSync(out) && fs.statSync(out).size > 10000) return out
  const SR = 44100
  const N = Math.round(secs * SR)
  const chord = [110.0, 164.81, 220.0, 261.63, 493.88]
  const mix = [0.32, 0.26, 0.22, 0.20, 0.10]
  const buf = new Int16Array(N * 2)
  let lpL = 0, lpR = 0
  for (let i = 0; i < N; i++) {
    const t = i / SR
    const env = Math.min(1, t / 1.2) * Math.min(1, Math.max(0, (secs - t) / 2.5))
    let L = 0, R = 0
    chord.forEach((f, k) => {
      const lfo = .55 + .45 * Math.sin(TAU * (.05 + .013 * k) * t + k * 1.7)
      const det = 1 + .0015 * Math.sin(TAU * .07 * t + k)
      const sv = Math.sin(TAU * f * det * t + Math.sin(TAU * .5 * t) * .3)
      const pan = .5 + .35 * Math.sin(k * 2.1)
      L += sv * lfo * mix[k] * (1 - pan)
      R += sv * lfo * mix[k] * pan
    })
    const sub = .10 * Math.sin(TAU * 55 * t) * (.6 + .4 * Math.sin(TAU * .08 * t))
    const sh = (t % .75) < .045 ? (Math.random() * 2 - 1) * .05 * (1 - (t % .75) / .045) : 0
    L = (L * .5 + sub + sh * .7) * env
    R = (R * .5 + sub + sh) * env
    lpL += .18 * (L - lpL); lpR += .18 * (R - lpR)
    buf[2 * i] = Math.max(-32768, Math.min(32767, lpL * 32767 * .8)) | 0
    buf[2 * i + 1] = Math.max(-32768, Math.min(32767, lpR * 32767 * .8)) | 0
  }
  const raw = path.join(CFG.dirTmp, `amb_${secs}.raw`)
  fs.writeFileSync(raw, Buffer.from(buf.buffer))
  await runFF(['-f', 's16le', '-ar', String(SR), '-ac', '2', '-i', raw, '-c:a', 'aac', '-b:a', '128k', out])
  fs.unlinkSync(raw)
  return out
}

/* ════════════════════════════════════════════════════════════
 *  PRIMITIF GAMBAR
 * ════════════════════════════════════════════════════════════ */

const W = 1280, H = 720

function roundRect(x, px, py, w, h, r) {
  x.beginPath()
  x.moveTo(px + r, py)
  x.arcTo(px + w, py, px + w, py + h, r)
  x.arcTo(px + w, py + h, px, py + h, r)
  x.arcTo(px, py + h, px, py, r)
  x.arcTo(px, py, px + w, py, r)
  x.closePath()
}

function drawCover(x, img, px, py, w, h, focusY = .5) {
  const s = Math.max(w / img.width, h / img.height)
  const dw = img.width * s, dh = img.height * s
  x.drawImage(img, px + (w - dw) / 2, py + (h - dh) * focusY, dw, dh)
}

/** kartu foto: rounded, border terang, bayangan — ala typogaleri2 */
function photoCard(x, img, px, py, w, h, radius = 14, focusY = .5) {
  x.save()
  x.shadowColor = 'rgba(0,0,0,.5)'
  x.shadowBlur = 26
  x.shadowOffsetY = 10
  x.fillStyle = '#20201d'
  roundRect(x, px, py, w, h, radius)
  x.fill()
  x.restore()
  x.save()
  roundRect(x, px + 3, py + 3, w - 6, h - 6, radius - 3)
  x.clip()
  drawCover(x, img, px + 3, py + 3, w - 6, h - 6, focusY)
  x.restore()
  x.strokeStyle = 'rgba(255,255,255,.85)'
  x.lineWidth = 2.5
  roundRect(x, px + 1.5, py + 1.5, w - 3, h - 3, radius - 1)
  x.stroke()
}

/** polaroid putih miring (kartu ke-5) */
function polaroid(x, img, px, py, w, h, rot = -.10, focusY = .45) {
  x.save()
  x.translate(px, py)
  x.rotate(rot)
  x.shadowColor = 'rgba(0,0,0,.5)'
  x.shadowBlur = 20
  x.shadowOffsetY = 8
  x.fillStyle = '#f7f4ec'
  x.fillRect(-w / 2, -h / 2, w, h)
  x.shadowColor = 'transparent'
  x.save()
  x.beginPath()
  x.rect(-w / 2 + 6, -h / 2 + 6, w - 12, h * .68)
  x.clip()
  drawCover(x, img, -w / 2 + 6, -h / 2 + 6, w - 12, h * .68, focusY)
  x.restore()
  x.restore()
}

function chip(x, text, px, py, size = 14, alpha = 1) {
  x.save()
  x.globalAlpha = alpha
  x.font = `${size}px Pop`
  const w = x.measureText(text).width
  x.fillStyle = 'rgba(12,14,12,.62)'
  roundRect(x, px, py - size, w + 16, size + 9, 7)
  x.fill()
  x.fillStyle = 'rgba(255,255,255,.95)'
  x.shadowColor = 'rgba(0,0,0,.55)'
  x.shadowBlur = 5
  x.fillText(text, px + 8, py + 2)
  x.restore()
}

/** kurva emas dengan titik ujung — digambar sesuai progres p */
function goldCurve(x, p, [x0, y0], [cx, cy], [x1, y1], width = 3.2) {
  if (p <= 0) return
  x.save()
  x.strokeStyle = '#d9b45a'
  x.lineWidth = width
  x.shadowColor = 'rgba(217,180,90,.45)'
  x.shadowBlur = 6
  x.beginPath()
  x.moveTo(x0, y0)
  const steps = 26
  const n = Math.max(2, Math.round(steps * p))
  for (let i = 1; i <= n; i++) {
    const u = (i / steps) * p
    const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u
    x.lineTo(a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1)
  }
  x.stroke()
  const ue = p
  const a = (1 - ue) * (1 - ue), b = 2 * (1 - ue) * ue, c = ue * ue
  x.fillStyle = '#e8c877'
  x.beginPath(); x.arc(a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1, 4.2, 0, TAU); x.fill()
  x.restore()
}

/* ════════════════════════════════════════════════════════════
 *  RENDERER TYPOGALERI
 *  • videoPath ada → LATAR = VIDEO USER BERGERAK (decode frame-per-frame,
 *    9:16 otomatis center-crop ke 16:9)
 *  • videoPath null → latar foto statis + ken-burns
 *  5 gambar: 4 kartu + 1 polaroid
 * ════════════════════════════════════════════════════════════ */

async function renderTypogaleri({ bgPath, videoPath, photos, outPath, theme, archiveBy, outDur }) {
  const { createCanvas, loadImage } = CV
  const DURATION = Math.max(CFG.minDur, outDur || CFG.duration)
  const fps = CFG.fps
  const frames = Math.round(DURATION * fps)

  const ph = await Promise.all(photos.map(p => loadImage(p).catch(() => null)))
  const bgImg = videoPath ? null : await loadImage(bgPath)
  const slot = i => ph[i] || ph[0] || bgImg

  const canvas = createCanvas(W, H)
  const x = canvas.getContext('2d')

  /* kanvas latar utk frame video live */
  let bgCanvas = null, bgCtx = null
  if (videoPath) {
    bgCanvas = createCanvas(W, H)
    bgCtx = bgCanvas.getContext('2d')
  }

  const big = theme.bigWord || 'GALERI'
  const placeLines = (Array.isArray(theme.place) ? theme.place : String(theme.place || 'Indonesia').split(',').map(s => s.trim()))
    .map(s => s.trim()).filter(Boolean).slice(0, 2)

  /* posisi huruf kata besar — dukung SPASI + auto-fit utk judul panjang */
  const maxBigW = W - 130
  let bigSize = 104
  const measureBig = size => {
    x.font = `${size}px Anton`
    return [...big].map(ch => x.measureText(ch).width)
  }
  const totalW = ws => ws.reduce((a, b) => a + b + 9, -9)
  let letterWs = measureBig(bigSize)
  while (totalW(letterWs) > maxBigW && bigSize > 40) {
    bigSize -= 6
    letterWs = measureBig(bigSize)
  }
  const letterSpace = 9
  const letters = [...big].map((ch, i) => ({ ch, w: letterWs[i] }))
  let lx = (W - totalW(letterWs)) / 2
  for (const l of letters) { l.x = lx; lx += l.w + letterSpace }
  const bigY = 452

  /* geometri 5 slot foto (typogaleri2) */
  const CARDS = [
    { x: 26, y: 218, w: 286, h: 232, r: 16, rot: .012, focus: .35, t0: .55, floatA: 4, floatT: 9, ph: 0 },     // kiri atas
    { x: 894, y: 252, w: 352, h: 176, r: 16, rot: .012, focus: .42, t0: 1.0, floatA: 4, floatT: 11, ph: 2.1 }, // kanan atas
    { x: 52, y: 474, w: 330, h: 184, r: 16, rot: -.018, focus: .5, t0: 1.5, floatA: 4, floatT: 8, ph: 3.9 },   // kiri bawah
    { x: 906, y: 452, w: 344, h: 178, r: 16, rot: -.014, focus: .5, t0: 2.0, floatA: 4, floatT: 10, ph: 5.2 }  // kanan bawah
  ]
  const POLA = { x: 470, y: 600, w: 156, h: 112, rot: -.11, focus: .45, t0: 2.35, floatA: 3.5, floatT: 7, ph: 1.2 } // kartu ke-5

  /* ── decoder video → frame RGBA 1280x720 (crop tengah 16:9) ── */
  let readFrame = null, lastBG = null, dec = null
  if (videoPath) {
    const bin = await findFfmpeg()
    dec = spawn(bin, ['-hide_banner', '-loglevel', 'error', '-nostats',
      '-t', String(DURATION), '-i', videoPath,
      '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${fps}`,
      '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'],
      { stdio: ['ignore', 'pipe', 'ignore'] })
    const FB = W * H * 4
    let pool = [], poolLen = 0, ended = false
    dec.stdout.on('data', c => { pool.push(c); poolLen += c.length })
    dec.stdout.once('end', () => { ended = true })
    dec.once('error', () => { ended = true })
    readFrame = async () => {
      while (poolLen < FB) {
        if (ended) return null
        await sleep(2)
      }
      const need = Buffer.allocUnsafe(FB)
      let off = 0
      while (off < FB) {
        const head = pool[0]
        const take = Math.min(head.length, FB - off)
        head.copy(need, off, 0, take)
        off += take; poolLen -= take
        if (take === head.length) pool.shift()
        else pool[0] = head.subarray(take)
      }
      return need
    }
  }

  function paint(t) {
    /* ===== LATAR: video live / foto ken-burns ===== */
    if (videoPath && bgCanvas) {
      // frame video sudah 1280x720 (16:9) — digambar penuh
      x.drawImage(bgCanvas, 0, 0)
    } else if (bgImg) {
      const breathe = 1 + .012 * Math.sin(TAU * t / DURATION - Math.PI / 2)
      const s = (1.06 + .07 * (t / DURATION)) * breathe
      const panX = 30 * (t / DURATION) - 15
      x.fillStyle = '#000'
      x.fillRect(0, 0, W, H)
      const dw = W * s, dh = H * s
      x.drawImage(bgImg, (W - dw) / 2 + panX, (H - dh) / 2, dw, dh)
    }
    /* gelapkan bawah & atas agar UI terbaca */
    let g = x.createLinearGradient(0, H * .4, 0, H)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,.6)')
    x.fillStyle = g
    x.fillRect(0, H * .4, W, H * .6)
    g = x.createLinearGradient(0, 0, 0, 140)
    g.addColorStop(0, 'rgba(0,0,0,.38)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g
    x.fillRect(0, 0, W, 140)

    /* nav pil */
    {
      const a = easeOut(win(t, .1, .7))
      const py = 44 + 14 * (1 - a)
      x.save()
      x.globalAlpha = a
      x.font = '15px PopM'
      const items = ['Home', 'About', 'News', 'All']
      const ws = items.map(tx => x.measureText(tx).width)
      const gap = 36, pad = 6
      const total = ws.reduce((m, n) => m + n, 0) + gap * 3 + pad * 2
      let px = (W - total) / 2
      x.fillStyle = 'rgba(15,17,15,.48)'
      roundRect(x, px - pad, py - 19, total + pad * 2, 34, 17)
      x.fill()
      items.forEach((tx, i) => {
        x.fillStyle = i === 0 ? '#fff' : 'rgba(255,255,255,.75)'
        x.fillText(tx, px, py)
        px += ws[i] + gap
      })
      x.restore()
    }

    /* "Galer" + subtitle */
    {
      const a = easeOut(win(t, .25, 1.0))
      x.save()
      x.globalAlpha = a
      x.translate(-40 * (1 - a), 0)
      x.font = '128px Anton'
      x.fillStyle = '#fff'
      x.shadowColor = 'rgba(0,0,0,.55)'
      x.shadowBlur = 18
      x.fillText('Gallery', 24, 176)
      x.shadowBlur = 0
      if (theme.subtitle) {
        x.font = '22px PopM'
        x.fillStyle = 'rgba(255,255,255,.92)'
        x.fillText(theme.subtitle, 32, 210)
      }
      x.restore()
    }

    /* Archive by <nama> */
    {
      const a = easeOut(win(t, 1.6, 2.3))
      if (a > 0) {
        x.save()
        x.globalAlpha = a
        x.textAlign = 'center'
        const cxx = 948, cyy = 128
        x.strokeStyle = 'rgba(255,255,255,.95)'
        x.lineWidth = 2.6
        x.beginPath()
        x.arc(cxx - 10, cyy + 4, 9, Math.PI * .5, Math.PI * 1.5)
        x.arc(cxx, cyy - 4, 11, Math.PI, Math.PI * 1.9)
        x.arc(cxx + 11, cyy + 3, 8, Math.PI * 1.2, Math.PI * .5)
        x.closePath()
        x.stroke()
        x.font = '21px PopSB'
        x.fillStyle = '#fff'
        x.shadowColor = 'rgba(0,0,0,.55)'
        x.shadowBlur = 8
        x.fillText('Archive by', 1064, 136)
        x.font = '46px Vibes'
        x.fillStyle = '#f3c66b'
        x.fillText(archiveBy, 1064, 184)
        x.restore()
      }
    }

    /* 4 kartu — muncul satu-satu dgn slide+fade+zoom */
    for (let i = 0; i < CARDS.length; i++) {
      const c = CARDS[i]
      const a = easeOut(win(t, c.t0, c.t0 + .65))
      if (a <= 0) continue
      const back = easeBack(win(t, c.t0, c.t0 + .75))
      const float = c.floatA * Math.sin(TAU * t / c.floatT + c.ph)
      const cxm = c.x + c.w / 2, cym = c.y + c.h / 2
      x.save()
      x.globalAlpha = a
      x.translate(cxm, cym + (1 - back) * 46 + float)
      x.rotate(c.rot * (0.4 + 0.6 * a))
      const sc = .88 + .12 * back
      x.scale(sc, sc)
      const im = slot(i)
      if (im) photoCard(x, im, -c.w / 2, -c.h / 2, c.w, c.h, c.r, c.focus)
      x.restore()
    }

    /* kartu ke-5: polaroid miring */
    {
      const c = POLA
      const a = easeOut(win(t, c.t0, c.t0 + .6))
      if (a > 0) {
        const back = easeBack(win(t, c.t0, c.t0 + .7))
        const float = c.floatA * Math.sin(TAU * t / c.floatT + c.ph)
        x.save()
        x.globalAlpha = a
        x.translate(c.x, c.y + (1 - back) * 40 + float)
        x.rotate(c.rot * (0.4 + 0.6 * a))
        const sc = .85 + .15 * back
        x.scale(sc, sc)
        const im = slot(4)
        if (im) polaroid(x, im, 0, 0, c.w, c.h, 0, c.focus)
        x.restore()
      }
    }

    /* garis emas penghubung */
    goldCurve(x, easeInOut(win(t, 1.05, 1.9)), [150, 232], [96, 336], [96, 466])
    goldCurve(x, easeInOut(win(t, 2.15, 3.0)), [400, 556], [640, 640], [898, 548])
    goldCurve(x, easeInOut(win(t, 2.45, 3.2)), [1052, 200], [1122, 232], [1096, 248])
    goldCurve(x, easeInOut(win(t, 2.6, 3.3)), [402, 596], [436, 612], [452, 620], 2.6)

    /* caption chips */
    {
      const baseX = 292, baseY = 420
      CAPTIONS.forEach((cpt, i) => {
        const a = easeOut(win(t, 2.3 + i * .25, 2.85 + i * .25))
        if (a <= 0) return
        const cy = baseY + i * 34
        x.save()
        x.globalAlpha = a * .9
        x.strokeStyle = 'rgba(255,255,255,.8)'
        x.lineWidth = 2
        x.beginPath(); x.moveTo(baseX - 26, cy - 5); x.lineTo(baseX - 4, cy - 5); x.stroke()
        x.restore()
        chip(x, cpt, baseX, cy, 14, a)
      })
    }

    /* kata besar huruf demi huruf */
    letters.forEach((l, i) => {
      if (l.ch === ' ') return // spasi tidak digambar
      const a = easeOut(win(t, .8 + i * .07, 1.55 + i * .07))
      x.save()
      x.globalAlpha = a
      const dy = (1 - a) * 34
      x.font = `${bigSize}px Anton`
      x.fillStyle = '#fff'
      x.shadowColor = 'rgba(0,0,0,.65)'
      x.shadowBlur = 20
      x.fillText(l.ch, l.x, bigY + dy)
      x.restore()
    })

    /* "by" + script emas 2 baris */
    {
      const a = easeInOut(win(t, 1.55, 2.5))
      if (a > 0) {
        x.save()
        x.textAlign = 'center'
        x.shadowColor = 'rgba(0,0,0,.5)'
        x.shadowBlur = 10
        x.globalAlpha = a * .95
        x.font = 'italic 17px PopM'
        x.fillStyle = '#f0c05c'
        x.fillText('by', W / 2, bigY + 42)
        const rows = placeLines.length === 1
          ? [[placeLines[0], bigY + 124, 52]]
          : [[placeLines[0] || 'Indonesia', bigY + 96, 52], [placeLines[1] || '', bigY + 152, 52]].filter(r => r[1] !== undefined && r[0])
        rows.forEach(([txt, ty, size], ri) => {
          const pa = easeInOut(win(t, 1.7 + ri * .3, 2.7 + ri * .3))
          if (pa <= 0) return
          x.font = `${size}px Vibes`
          x.fillStyle = '#f3c66b'
          const tw = x.measureText(txt).width
          x.save()
          x.beginPath()
          x.rect(W / 2 - tw / 2 - 20, ty - size, (tw + 40) * pa, size + 18)
          x.clip()
          x.globalAlpha = a
          x.fillText(txt, W / 2, ty)
          x.restore()
        })
        x.restore()
      }
    }

    /* footer emas */
    {
      const a = easeOut(win(t, 2.2, 2.9))
      if (a > 0) {
        x.save()
        x.globalAlpha = a
        x.font = 'italic 25px PopM'
        x.fillStyle = '#f0c05c'
        x.shadowColor = 'rgba(0,0,0,.6)'
        x.shadowBlur = 8
        x.fillText('Aesthetic', 48, 700)
        x.textAlign = 'right'
        x.fillText('Beautiful', W - 48, 700)
        x.restore()
      }
    }

    /* light sweep 2x */
    for (const [s0, s1] of [[2.8, 5.2], [DURATION * .58, DURATION * .58 + 2.6]]) {
      const p = (t - s0) / (s1 - s0)
      if (p > 0 && p < 1) {
        const px = -500 + p * (W + 1000)
        x.save()
        const lg = x.createLinearGradient(px - 260, 0, px + 260, H)
        lg.addColorStop(0, 'rgba(255,255,255,0)')
        lg.addColorStop(.5, `rgba(255,255,255,${.10 * Math.sin(Math.PI * p)})`)
        lg.addColorStop(1, 'rgba(255,255,255,0)')
        x.globalCompositeOperation = 'screen'
        x.fillStyle = lg
        x.fillRect(0, 0, W, H)
        x.restore()
      }
    }

    /* grain sinematik */
    {
      const n = CV.createCanvas(320, 180)
      const nx = n.getContext('2d')
      const id = nx.createImageData(320, 180)
      for (let i = 0; i < id.data.length; i += 4) {
        const v = (100 + Math.random() * 100) | 0
        id.data[i] = id.data[i + 1] = id.data[i + 2] = v
        id.data[i + 3] = 255
      }
      nx.putImageData(id, 0, 0)
      x.save()
      x.globalAlpha = .05
      x.globalCompositeOperation = 'overlay'
      x.drawImage(n, 0, 0, W, H)
      x.restore()
    }

    /* vignette */
    const vg = x.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * .95)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(0,0,0,.30)')
    x.fillStyle = vg
    x.fillRect(0, 0, W, H)
  }

  /* ── encode: frame canvas → H264 yuv420p (kompatibel WA) ── */
  const bin = await findFfmpeg()
  const ff = spawn(bin, ['-hide_banner', '-loglevel', 'error', '-nostats', '-y',
    '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level:v', '4.0',
    '-movflags', '+faststart', outPath],
    { stdio: ['pipe', 'ignore', 'pipe'] })
  let ffErr = ''
  ff.stderr.on('data', d => { ffErr += d; if (ffErr.length > 8000) ffErr = ffErr.slice(-4000) })
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c + ' ' + ffErr.slice(-1200)))))

  try {
    for (let i = 0; i < frames; i++) {
      if (readFrame) {
        const f = await readFrame()
        if (f) {
          lastBG = f
          const id = bgCtx.createImageData(W, H)
          id.data.set(f)
          bgCtx.putImageData(id, 0, 0)
        } else if (lastBG) {
          // video lebih pendek dari durasi output → bekukan frame terakhir
          const id = bgCtx.createImageData(W, H)
          id.data.set(lastBG)
          bgCtx.putImageData(id, 0, 0)
        } else break
      }
      paint(i / fps)
      const buf = await canvas.encode('jpeg', 92)
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r))
    }
  } finally {
    ff.stdin.end()
    if (dec) { try { dec.kill('SIGKILL') } catch { } }
  }
  await done
}

/* ════════════════════════════════════════════════════════════
 *  MUX AUDIO + THUMBNAIL
 * ════════════════════════════════════════════════════════════ */

/** audio asli dari video sumber */
async function muxOriginalAudio(videoPath, sourcePath, outPath) {
  await runFF(['-i', videoPath, '-i', sourcePath,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k',
    '-shortest', '-movflags', '+faststart', outPath])
}

/** musik ambient (fallback) */
async function muxAmbient(videoPath, audioPath, outPath) {
  await runFF(['-i', videoPath, '-i', audioPath,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k',
    '-shortest', '-movflags', '+faststart', outPath])
}

async function squareThumb(videoPath, outPath, size = 320) {
  const vf = `crop=min(iw\\,ih):min(iw\\,ih),scale=${size}:${size}`
  try {
    await runFF(['-ss', '00:00:03', '-i', videoPath, '-frames:v', '1', '-vf', vf, '-q:v', '4', outPath])
  } catch {
    await runFF(['-i', videoPath, '-frames:v', '1', '-vf', vf, '-q:v', '4', outPath])
  }
  return outPath
}

/* ════════════════════════════════════════════════════════════
 *  HANDLER
 * ════════════════════════════════════════════════════════════ */

let handler = async (m, { conn, text, command, store }) => {
  const jid = m.chat
  const reply = t => (typeof m.reply === 'function' ? m.reply(t) : conn.sendMessage(jid, { text: t }, { quoted: m }))
  const react = e => (typeof m.react === 'function' ? m.react(e).catch(() => { }) : Promise.resolve())
  const tmpId = crypto.randomBytes(4).toString('hex')
  const cleanup = []
  let stage = 'mulai'

  try {
    const q = m.quoted ? m.quoted : m
    const mime = q.mimetype || q.msg?.mimetype
      || q.videoMessage?.mimetype || q.imageMessage?.mimetype || q.documentMessage?.mimetype
      || q.msg?.videoMessage?.mimetype || q.msg?.imageMessage?.mimetype || q.msg?.documentMessage?.mimetype
      || ''
    if (!/video\/|image\//.test(mime) || /webp/.test(mime))
      return reply(
        '🎞️ *T Y P O G A L E R I 2*\n\nReply *video* (atau foto) lalu ketik:\n' +
        '`.typogaleri2 judul|tempat`\n\nContoh:\n' +
        '`.typogaleri2 bulu wol|sigi`\n' +
        '`.typogaleri2 nelayan pantai|pantai kuta, bali`\n\n' +
        '🖼️ Latar = videomu bergerak • 🔊 audio asli • 📸 5 momen jadi kartu')

    /* ---- argumen: ".typogaleri2 judul|tempat" → murni dari user, TANPA tema acak
        contoh: ".typogaleri2 bulu wol|sigi" → besar "BULU WOL", script emas "Sigi" ---- */
    const raw = String(text || '').trim()
    const parts = raw.split('|').map(s => s.trim()).filter(Boolean)
    const judul = (parts[0] || DEFAULT_JUDUL).slice(0, 20)
    const tempatParts = (parts[1] || DEFAULT_TEMPAT).split(',').map(s => s.trim()).filter(Boolean).slice(0, 2)
    const theme = {
      bigWord: judul.toUpperCase(),
      subtitle: '', // tanpa subjudul acak — tempat tampil di script emas
      place: tempatParts
    }

    const pushname = (m.pushName || 'bxb_').split(' ')[0].toLowerCase()
    const archiveBy = pushname || 'bxb_'

    await react('⏳')
    fs.mkdirSync(CFG.dirTmp, { recursive: true })

    const isVideo = /video\//.test(mime)
    const waType = isVideo ? 'video' : 'image'

    /* ---- 1) unduh media user (smartDownload) ---- */
    stage = 'unduh media'
    const fontsReady = initCanvas().then(() => ensureFonts())
    const buf = await smartDownload(q, conn, store, waType)
    if (!buf || !buf.length) throw new Error('media kosong / tidak terbaca')
    await fontsReady

    const inPath = path.join(CFG.dirTmp, `in_${tmpId}.${isVideo ? 'mp4' : 'jpg'}`)
    fs.writeFileSync(inPath, buf)
    cleanup.push(inPath)

    /* ---- 2) info media + 5 gambar dari momen tetap ---- */
    stage = 'ambil momen'
    await react('📸')
    let photos, bg = null, outDur = CFG.duration, hasAudio = false
    if (isVideo) {
      ;({ photos } = await stillsFromVideo(inPath, CFG.dirTmp, tmpId))
      const info = await probeMedia(inPath)
      outDur = clamp(info.dur, CFG.minDur, CFG.maxDur)
      hasAudio = info.hasAudio
    } else {
      ;({ photos, bg } = await stillsFromPhoto(inPath, CFG.dirTmp, tmpId))
    }
    cleanup.push(...photos, bg)

    /* ---- 3) render 1 video typogaleri2 (latar = video bergerak) ---- */
    stage = 'render'
    await react('🎨')
    const t0 = Date.now()
    const silent = path.join(CFG.dirTmp, `s_${tmpId}.mp4`)
    cleanup.push(silent)
    await renderTypogaleri({
      bgPath: bg,
      videoPath: isVideo ? inPath : null,
      photos,
      outPath: silent,
      theme,
      archiveBy,
      outDur
    })

    /* ---- audio: ASLI dari video user, fallback musik ambient ---- */
    const outPath = path.join(CFG.dirTmp, `tg_${tmpId}.mp4`)
    cleanup.push(outPath)
    if (isVideo && hasAudio) {
      await muxOriginalAudio(silent, inPath, outPath)
    } else {
      const ambient = await getAmbient(outDur)
      await muxAmbient(silent, ambient, outPath)
    }
    if (!fs.existsSync(outPath) || fs.statSync(outPath).size < 10000)
      throw new Error('output render kosong')

    const thumbFile = path.join(CFG.dirTmp, `thumb_${tmpId}.jpg`)
    cleanup.push(thumbFile)
    let thumbBuf = null
    try { await squareThumb(outPath, thumbFile); thumbBuf = fs.readFileSync(thumbFile) } catch { }

    /* ---- 4) kirim sebagai VIDEO BIASA (bukan bulat/PTV) ---- */
    stage = 'kirim'
    await react('🎞️')
    const audioNote = isVideo && hasAudio ? '🔊 audio asli videomu' : '🎵 musik ambient'
    const caption =
      `🎞️ *Typography Galeri Panorama* — ${cap(judul)}\n` +
      `📍 ${cap(tempatParts.join(', '))}\n` +
      `🖼️ latar videomu • 📸 5 momen • ${audioNote} • ${Math.round(outDur)} dtk • rakit ${((Date.now() - t0) / 1000).toFixed(1)}s\n\n` +
      `© ${archiveBy}`

    const outBuf = fs.readFileSync(outPath)
    await sendWithRetry(() => conn.sendMessage(jid, {
      video: outBuf,              // ← video biasa (persegi), BUKAN ptv/video note
      caption,
      ...(thumbBuf ? { jpegThumbnail: thumbBuf } : {})
    }, { quoted: m }))

    await react('✅')

    /* bersih-bersih video lama */
    try {
      const files = fs.readdirSync(CFG.dirTmp).filter(f => /^tg_.*\.mp4$/.test(f)).sort()
      while (files.length > CFG.maxKeep) fs.unlinkSync(path.join(CFG.dirTmp, files.shift()))
    } catch { }

  } catch (e) {
    console.error('[typogaleri2] ERROR:', e)
    await react('❌').catch(() => { })
    const why = errWhy(e)
    const hint = /fetch failed|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ENETUNREACH|ETIMEDOUT|EHOSTUNREACH|timeout|certificate|tls/i.test(why)
      ? '\n\n💡 Kemungkinan koneksi server ke CDN WhatsApp terganggu (sering karena IPv6 rusak/DNS). Coba lagi, atau set DNS 8.8.8.8 di server.'
      : ''
    await reply(`❌ Typogaleri gagal [${stage}]:\n${why.slice(0, 300)}` + hint)
  } finally {
    for (const f of cleanup) await fs.promises.unlink(f).catch(() => { })
  }
}

handler.command = /^(typogaleri2|typogaleri|tg2)$/i
handler.tags = ['maker']
handler.help = ['typogaleri2 judul|tempat (reply video/foto)']
handler.limit = false
handler.premium = false

export default handler