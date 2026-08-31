import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'

try {
    GlobalFonts.registerFromPath('/home/container/src/font/Roboto-Regular.ttf', 'Roboto')
    GlobalFonts.registerFromPath('/home/container/src/font/Roboto-Bold.ttf', 'Roboto Bold')
    GlobalFonts.registerFromPath('/home/container/src/font/Roboto-Italic.ttf', 'Roboto Italic')
} catch (e) {
    console.log('Font error:', e)
}

const FONT = 'Roboto'
const BG_PATH = '/home/container/src/Aesthetic/welcome-bg.jpg'
const DEFAULT_PP = '/home/container/src/avatar_contact.png'

const drawOverlay = (ctx, W, H) => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(0, 0, W, H)
}

const unicodeToAscii = (str) => {
    const ranges = [
        [0x1D400, 0x1D419, 65],
        [0x1D41A, 0x1D433, 97],
        [0x1D434, 0x1D44D, 65],
        [0x1D44E, 0x1D467, 97]
    ]

    return [...(str || '')].map(c => {
        const cp = c.codePointAt(0)

        for (const [start, end, base] of ranges) {
            if (cp >= start && cp <= end) {
                return String.fromCharCode(base + (cp - start))
            }
        }

        return c
    }).join('')
}

const cleanText = (str, max = 25) => {
    let s = unicodeToAscii(str || '').trim()
    return s.length > max ? s.slice(0, max) + '...' : s
}

const drawAvatar = async (ctx, x, y, r, avatarUrl) => {
    let img

    try {
        img = await loadImage(avatarUrl || DEFAULT_PP)
    } catch {
        img = await loadImage(DEFAULT_PP)
    }

    ctx.save()

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(img, x - r, y - r, r * 2, r * 2)

    ctx.restore()

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 6

    ctx.beginPath()
    ctx.arc(x, y, r + 3, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 14

    ctx.beginPath()
    ctx.arc(x, y, r + 12, 0, Math.PI * 2)
    ctx.stroke()
}

const baseCanvas = async () => {
    const W = 1000
    const H = 560

    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    try {
        const bg = await loadImage(BG_PATH)
        ctx.drawImage(bg, 0, 0, W, H)
    } catch {
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, W, H)
    }

    drawOverlay(ctx, W, H)

    return { canvas, ctx, W, H }
}

export const createWelcomeCanvas = async (data) => {
    const { canvas, ctx, W, H } = await baseCanvas()

    const centerX = W / 2

    const groupName = cleanText(data.groupName, 28)
    const userName = cleanText(data.name, 20)

    ctx.textAlign = 'center'

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold 22px ${FONT}`

    ctx.fillText(groupName, centerX, 110)

    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = `16px ${FONT}`

    ctx.fillText('WELCOME TO THE GROUP', centerX, 145)

    await drawAvatar(ctx, centerX, 260, 95, data.avatarUrl)

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold 42px ${FONT}`

    ctx.fillText('WELCOME', centerX, 410)

    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = `bold 24px ${FONT}`

    ctx.fillText(userName, centerX, 450)

    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.font = `16px ${FONT}`

    ctx.fillText(`Member #${data.count}`, centerX, 485)

    return canvas.toBuffer('image/png')
}

export const createGoodbyeCanvas = async (data) => {
    const { canvas, ctx, W, H } = await baseCanvas()

    const centerX = W / 2

    const groupName = cleanText(data.groupName, 28)
    const userName = cleanText(data.name, 20)

    ctx.textAlign = 'center'

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold 22px ${FONT}`

    ctx.fillText(groupName, centerX, 110)

    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = `16px ${FONT}`

    ctx.fillText('SEE YOU AGAIN', centerX, 145)

    await drawAvatar(ctx, centerX, 260, 95, data.avatarUrl)

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold 42px ${FONT}`

    ctx.fillText('GOODBYE', centerX, 410)

    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = `bold 24px ${FONT}`

    ctx.fillText(userName, centerX, 450)

    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.font = `16px ${FONT}`

    ctx.fillText(`${data.count} members left`, centerX, 485)

    return canvas.toBuffer('image/png')
}