/*
✦ Nama Plugin: weather canvas
✦ Tipe: Plugin Esm
✦ Author plugin : Blackrose
✦ channel : https://whatsapp.com/channel/0029VbBt4432f3ENa8ULoM1J
✦ Recode with canvas : kyuu masih amatir
✦ channel : https://whatsapp.com/channel/0029Vb7gcbuLdQelWzrTzD3D
✦ Note: jangan hapus wm
*/
import axios from 'axios'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const TMP_ROOT = join(tmpdir(), 'weather-canvas')
const FONT_DIR = join(TMP_ROOT, 'fonts')
const ASSET_DIR = join(TMP_ROOT, 'assets')

const APPLE_EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json'
const APPLE_EMOJI_JSON_LOCAL = join(FONT_DIR, 'emoji-apple-image.json')

const POPPINS_WEIGHTS = [
    { weight: 300, file: 'Poppins-Light.ttf' },
    { weight: 400, file: 'Poppins-Regular.ttf' },
    { weight: 600, file: 'Poppins-SemiBold.ttf' }
]

const BACKGROUNDS = {
    clear: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1600&q=80',
    clouds: 'https://images.unsplash.com/photo-1499956827185-0d63ee78a910?w=1600&q=80',
    rain: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1600&q=80',
    drizzle: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1600&q=80',
    thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1600&q=80',
    snow: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1600&q=80',
    mist: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1600&q=80',
    default: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1600&q=80'
}

let appleEmojiMap = null

async function downloadFile(url) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        maxRedirects: 5
    })
    return Buffer.from(res.data)
}

function emojiToUnicode(emoji) {
    return [...emoji].map(c => c.codePointAt(0).toString(16)).join('-')
}

async function loadAppleEmojiMap() {
    if (appleEmojiMap) return appleEmojiMap
    if (!existsSync(APPLE_EMOJI_JSON_LOCAL)) {
        const buf = await downloadFile(APPLE_EMOJI_JSON_URL)
        await writeFile(APPLE_EMOJI_JSON_LOCAL, buf)
    }
    appleEmojiMap = JSON.parse(await readFile(APPLE_EMOJI_JSON_LOCAL, 'utf-8'))
    return appleEmojiMap
}

async function drawAppleEmoji(ctx, emoji, x, y, size) {
    const map = await loadAppleEmojiMap()
    const base = emojiToUnicode(emoji)
    const variants = [base, base.replace(/-fe0f/g, ''), base.toUpperCase(), base.replace(/-fe0f/g, '').toUpperCase()]
    let b64 = null
    for (const v of variants) {
        if (map[v]) { b64 = map[v]; break }
    }
    if (!b64) { ctx.fillText(emoji, x, y); return }
    const img = await loadImage(Buffer.from(b64, 'base64'))
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size)
}

function measureTextCustom(ctx, text, fontSize) {
    const parts = text.split(/(\p{Extended_Pictographic})/gu)
    let total = 0
    for (const part of parts) {
        if (!part) continue
        if (/\p{Extended_Pictographic}/u.test(part)) total += fontSize * 1.05
        else total += ctx.measureText(part).width
    }
    return total
}

async function drawTextWithEmojis(ctx, text, x, y, fontSize) {
    const parts = text.split(/(\p{Extended_Pictographic})/gu)
    let cx = x
    for (const part of parts) {
        if (!part) continue
        if (/\p{Extended_Pictographic}/u.test(part)) {
            const size = fontSize * 1.05
            await drawAppleEmoji(ctx, part, cx + size / 2, y - fontSize * 0.35, size)
            cx += size
        } else {
            ctx.fillText(part, cx, y)
            cx += ctx.measureText(part).width
        }
    }
}

async function ensureAssets() {
    await mkdir(FONT_DIR, { recursive: true })
    await mkdir(ASSET_DIR, { recursive: true })

    for (const f of POPPINS_WEIGHTS) {
        const dest = join(FONT_DIR, f.file)
        if (!existsSync(dest)) {
            const css = await axios.get(
                `https://fonts.googleapis.com/css2?family=Poppins:wght@${f.weight}&display=swap`,
                { headers: { 'User-Agent': 'Mozilla/5.0' } }
            )
            const match = css.data.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)
            if (match) {
                const buf = await downloadFile(match[1])
                await writeFile(dest, buf)
            }
        }
        if (existsSync(dest)) GlobalFonts.registerFromPath(dest, 'Poppins')
    }

    await loadAppleEmojiMap()
}

async function getBackgroundImage(key) {
    const dest = join(ASSET_DIR, `${key}.jpg`)
    if (!existsSync(dest)) {
        const buf = await downloadFile(BACKGROUNDS[key] || BACKGROUNDS.default)
        await writeFile(dest, buf)
    }
    return await loadImage(dest)
}

function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
}

function drawCover(ctx, img, x, y, w, h) {
    const ir = img.width / img.height
    const cr = w / h
    let sx, sy, sw, sh
    if (ir > cr) {
        sh = img.height
        sw = sh * cr
        sx = (img.width - sw) / 2
        sy = 0
    } else {
        sw = img.width
        sh = sw / cr
        sx = 0
        sy = (img.height - sh) / 2
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function fitFontSize(ctx, text, maxWidth, weight, startSize, minSize = 14) {
    let size = startSize
    while (size > minSize) {
        ctx.font = `${weight} ${size}px Poppins`
        if (ctx.measureText(text).width <= maxWidth) break
        size -= 2
    }
    return size
}

function getWeatherKey(condition) {
    const c = (condition || '').toLowerCase()
    if (c.includes('clear')) return 'clear'
    if (c.includes('cloud')) return 'clouds'
    if (c.includes('drizzle')) return 'drizzle'
    if (c.includes('rain')) return 'rain'
    if (c.includes('thunderstorm')) return 'thunderstorm'
    if (c.includes('snow')) return 'snow'
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return 'mist'
    return 'default'
}

function getOverlayAlpha(key) {
    const alphas = { clear: 0.32, clouds: 0.5, mist: 0.55, snow: 0.55, rain: 0.38, drizzle: 0.38, thunderstorm: 0.3, default: 0.42 }
    return alphas[key] ?? alphas.default
}

function getWeatherIcon(condition) {
    const icons = { clear: '☀️', clouds: '☁️', rain: '🌧️', drizzle: '🌦️', thunderstorm: '⛈️', snow: '❄️', mist: '🌫️', default: '🌤️' }
    return icons[getWeatherKey(condition)] || icons.default
}

function getWindDirection(deg) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return dirs[Math.round(deg / 22.5) % 16]
}

function capitalize(str) {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function fmtLocalTime(unixUTC, offsetSeconds) {
    if (!unixUTC) return 'N/A'
    const d = new Date((unixUTC + (offsetSeconds || 0)) * 1000)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

async function renderWeatherCard(data) {
    await ensureAssets()

    const W = 1280
    const H = 800
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    const conditionMain = data.weather?.[0]?.main || ''
    const bgImg = await getBackgroundImage(getWeatherKey(conditionMain))

    ctx.save()
    ctx.filter = 'brightness(1.1) contrast(1.05) saturate(1.15)'
    drawCover(ctx, bgImg, 0, 0, W, H)
    ctx.restore()

    const grad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H)
    grad.addColorStop(0, 'rgba(255,255,255,0.18)')
    grad.addColorStop(1, 'rgba(0,0,0,0.32)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    const blurCanvas = createCanvas(W, H)
    const bctx = blurCanvas.getContext('2d')
    bctx.filter = 'blur(24px)'
    bctx.drawImage(canvas, 0, 0)

    const cardW = 1000
    const cardH = 560
    const cardX = (W - cardW) / 2
    const cardY = (H - cardH) / 2
    const radius = 28

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 50
    ctx.shadowOffsetY = 18
    ctx.fillStyle = 'rgba(0,0,0,0.01)'
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius)
    ctx.fill()
    ctx.restore()

    ctx.save()
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius)
    ctx.clip()
    ctx.drawImage(blurCanvas, cardX, cardY, cardW, cardH, cardX, cardY, cardW, cardH)
    const overlayAlpha = getOverlayAlpha(getWeatherKey(conditionMain))
    ctx.fillStyle = `rgba(8,10,18,${overlayAlpha})`
    ctx.fillRect(cardX, cardY, cardW, cardH)
    ctx.restore()

    ctx.save()
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius)
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.stroke()
    ctx.restore()

    const pad = 48
    const dividerX = cardX + cardW / 2

    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(dividerX, cardY + pad)
    ctx.lineTo(dividerX, cardY + cardH - pad)
    ctx.stroke()
    ctx.restore()

    ctx.textBaseline = 'alphabetic'
    ctx.shadowColor = 'rgba(0,0,0,0.45)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 2

    const leftX = cardX + pad
    const headerY = cardY + pad + 22
    ctx.font = '600 30px Poppins'
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    await drawTextWithEmojis(ctx, `${getWeatherIcon(conditionMain)} Weather Information`, leftX, headerY, 30)

    const items = [
        ['Location', `${data.name || 'N/A'}, ${data.sys?.country || 'N/A'}`],
        ['Feels Like', data.main?.feels_like != null ? `${Math.round(data.main.feels_like)}°C` : 'N/A'],
        ['Humidity', data.main?.humidity != null ? `${data.main.humidity}%` : 'N/A'],
        ['Pressure', data.main?.pressure != null ? `${data.main.pressure} hPa` : 'N/A'],
        ['Cloudiness', data.clouds?.all != null ? `${data.clouds.all}%` : 'N/A'],
        ['Visibility', data.visibility != null ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A'],
        ['Wind', `${data.wind?.speed ?? 'N/A'} m/s ${data.wind?.deg !== undefined ? getWindDirection(data.wind.deg) : ''}`.trim()],
        ['Sunrise', fmtLocalTime(data.sys?.sunrise, data.timezone)],
        ['Sunset', fmtLocalTime(data.sys?.sunset, data.timezone)]
    ]

    let iy = headerY + 56
    for (const [label, value] of items) {
        ctx.font = '300 22px Poppins'
        ctx.fillStyle = 'rgba(255,255,255,0.72)'
        ctx.fillText(label, leftX, iy)

        ctx.font = '600 22px Poppins'
        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        const valW = ctx.measureText(value).width
        ctx.fillText(value, cardX + cardW / 2 - pad - valW, iy)

        iy += 44
    }

    const rightX = dividerX + pad
    const rightW = cardX + cardW - pad - rightX

    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    const citySize = fitFontSize(ctx, data.name || '', rightW, 600, 64)
    ctx.font = `600 ${citySize}px Poppins`
    ctx.fillText(data.name || 'Unknown', rightX, cardY + pad + 60)

    ctx.font = '600 96px Poppins'
    const tempText = data.main?.temp != null ? `${Math.round(data.main.temp)}°C` : 'N/A'
    ctx.fillText(tempText, rightX, cardY + pad + 180)

    const description = capitalize(data.weather?.[0]?.description || '')
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    const descSize = fitFontSize(ctx, description, rightW, 400, 28)
    ctx.font = `400 ${descSize}px Poppins`
    ctx.fillText(description, rightX, cardY + pad + 222)

    const updatedAt = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false })
    ctx.font = '400 18px Poppins'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    await drawTextWithEmojis(ctx, `⏰ Updated: ${updatedAt} WIB`, rightX, cardY + cardH - pad, 18)

    return await canvas.encode('png')
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`❏ WEATHER INFO 🌤️

Usage: ${usedPrefix}${command} <city name>

Example:
${usedPrefix}weather Jakarta
${usedPrefix}weather Tokyo
${usedPrefix}weather New York`)
    }

    const city = args.join(' ').trim()
    const apiKey = 'ac61bb96d2ce45e36f01454afb2c5e6f'

    await m.react('🕒')

    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        let res
        try {
            res = await axios.get(apiUrl, { timeout: 10000 })
        } catch (e) {
            await m.react('❌')
            return m.reply('❌ City not found! Please check the spelling.')
        }

        const buffer = await renderWeatherCard(res.data)

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: `📍 ${res.data.name}, ${res.data.sys?.country || 'N/A'} • ${Math.round(res.data.main?.temp)}°C • ${capitalize(res.data.weather?.[0]?.description || '')}`
        }, { quoted: m })

        await m.react('✅')
    } catch (error) {
        console.error(error)
        await m.react('❌')
        m.reply('❌ An error occurred while fetching weather data.')
    }
}

handler.help = ['weather <city>']
handler.tags = ['info']
handler.command = /^weather$/i
handler.limit = true

export default handler
