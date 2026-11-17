import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import axios from 'axios'
import fs from 'fs'

const ASSETS_DIR = join(process.cwd(), 'assets', 'levelup')
const FONTS_DIR = join(ASSETS_DIR, 'fonts')

const FONTS = [
    {
        url: 'https://cdn.jsdelivr.net/gh/rsms/inter@v4.0/docs/font-files/Inter-Regular.woff2',
        file: 'Inter-Regular.woff2',
        family: 'Inter'
    },
    {
        url: 'https://cdn.jsdelivr.net/gh/rsms/inter@v4.0/docs/font-files/Inter-Bold.woff2',
        file: 'Inter-Bold.woff2',
        family: 'InterBold'
    }
]

async function dlBuf(url) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        maxRedirects: 5
    })
    return Buffer.from(res.data)
}

async function prepFonts() {
    await mkdir(FONTS_DIR, { recursive: true })
    for (const f of FONTS) {
        const dest = join(FONTS_DIR, f.file)
        if (!existsSync(dest)) await writeFile(dest, await dlBuf(f.url))
        GlobalFonts.registerFromPath(dest, f.family)
    }
}

export async function canvasLevelUp(pp, username, before, after, role) {
    await prepFonts()

    const W = 1000
    const H = 300
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    // background
    ctx.fillStyle = '#111214'
    ctx.fillRect(0, 0, W, H)

    // card
    ctx.save()
    ctx.beginPath()
    roundRect(ctx, 12, 12, W - 24, H - 24, 20)
    ctx.fillStyle = '#1e1f22'
    ctx.fill()
    ctx.restore()

    // top accent bar gradient
    const accentGrad = ctx.createLinearGradient(12, 0, W - 12, 0)
    accentGrad.addColorStop(0, '#5865F2')
    accentGrad.addColorStop(0.5, '#7c84f5')
    accentGrad.addColorStop(1, '#5865F2')
    ctx.fillStyle = accentGrad
    ctx.save()
    ctx.beginPath()
    roundRect(ctx, 12, 12, W - 24, 6, [6, 6, 0, 0])
    ctx.fill()
    ctx.restore()

    // subtle noise overlay on card
    ctx.save()
    ctx.globalAlpha = 0.03
    for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
    }
    ctx.restore()

    // glow behind avatar
    const glowGrad = ctx.createRadialGradient(118, 150, 0, 118, 150, 110)
    glowGrad.addColorStop(0, 'rgba(88,101,242,0.35)')
    glowGrad.addColorStop(1, 'rgba(88,101,242,0)')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 40, 240, H - 40)

    // avatar
    let avatar
    try {
        avatar = await loadImage(pp)
    } catch {
        try { avatar = await loadImage(fs.readFileSync('./src/avatar_contact.png')) } catch { avatar = null }
    }

    const avX = 118, avY = 150, avR = 72
    if (avatar) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(avX, avY, avR, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(avatar, avX - avR, avY - avR, avR * 2, avR * 2)
        ctx.restore()
    }

    // avatar ring gradient
    const ringGrad = ctx.createLinearGradient(avX - avR, avY - avR, avX + avR, avY + avR)
    ringGrad.addColorStop(0, '#7c84f5')
    ringGrad.addColorStop(0.5, '#5865F2')
    ringGrad.addColorStop(1, '#4752c4')
    ctx.save()
    ctx.beginPath()
    ctx.arc(avX, avY, avR + 4, 0, Math.PI * 2)
    ctx.strokeStyle = ringGrad
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.restore()

    // level badge on avatar
    const badgeX = avX + 50, badgeY = avY + 50
    ctx.save()
    ctx.beginPath()
    ctx.arc(badgeX, badgeY, 22, 0, Math.PI * 2)
    ctx.fillStyle = '#5865F2'
    ctx.fill()
    ctx.strokeStyle = '#111214'
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.font = `bold 16px InterBold`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(after), badgeX, badgeY)
    ctx.restore()

    const textX = 228
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    // LEVEL UP label
    ctx.font = `bold 13px InterBold`
    ctx.fillStyle = '#5865F2'
    ctx.fillText('LEVEL UP', textX, 68)

    // username
    ctx.font = `bold 38px InterBold`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(truncate(ctx, username, 600), textX, 115)

    // level arrow
    const lvlText = `${before}  →  ${after}`
    ctx.font = `bold 26px InterBold`
    ctx.fillStyle = '#b5bac1'
    ctx.fillText('Level ', textX, 155)
    const lvlLabelW = ctx.measureText('Level ').width
    ctx.fillStyle = '#ffffff'
    ctx.fillText(String(before), textX + lvlLabelW, 155)
    const beforeW = ctx.measureText(String(before)).width
    ctx.fillStyle = '#5865F2'
    ctx.fillText('  →  ', textX + lvlLabelW + beforeW, 155)
    const arrowW = ctx.measureText('  →  ').width
    ctx.fillStyle = '#ffffff'
    ctx.fillText(String(after), textX + lvlLabelW + beforeW + arrowW, 155)

    // role badge
    const roleText = role || ''
    ctx.font = `13px Inter`
    const roleW = ctx.measureText(roleText).width
    const badgePadX = 14, badgePadY = 7
    const roleBadgeX = textX
    const roleBadgeY = 170
    ctx.save()
    ctx.beginPath()
    roundRect(ctx, roleBadgeX, roleBadgeY, roleW + badgePadX * 2, 28, 6)
    ctx.fillStyle = 'rgba(88,101,242,0.2)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(88,101,242,0.5)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = '#b5bac1'
    ctx.font = `13px Inter`
    ctx.fillText(roleText, roleBadgeX + badgePadX, roleBadgeY + 19)

    // XP bar background
    const barX = textX, barY = 218, barW = W - textX - 40, barH = 14
    ctx.save()
    ctx.beginPath()
    roundRect(ctx, barX, barY, barW, barH, barH / 2)
    ctx.fillStyle = '#2b2d31'
    ctx.fill()
    ctx.restore()

    // XP bar fill (animating from before to after visually)
    const pct = Math.min((after % 10) / 10, 1)
    const fillW = Math.max(barH, barW * pct)
    const barGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0)
    barGrad.addColorStop(0, '#4752c4')
    barGrad.addColorStop(1, '#7c84f5')
    ctx.save()
    ctx.beginPath()
    roundRect(ctx, barX, barY, fillW, barH, barH / 2)
    ctx.fillStyle = barGrad
    ctx.fill()
    ctx.restore()

    // XP bar glow
    ctx.save()
    ctx.shadowColor = '#5865F2'
    ctx.shadowBlur = 12
    ctx.beginPath()
    roundRect(ctx, barX, barY, fillW, barH, barH / 2)
    ctx.fillStyle = 'rgba(88,101,242,0.3)'
    ctx.fill()
    ctx.restore()

    // XP label
    ctx.font = `12px Inter`
    ctx.fillStyle = '#6d6f78'
    ctx.fillText(`XP`, barX, barY + barH + 18)
    ctx.textAlign = 'right'
    ctx.fillText(`LVL ${after}`, barX + barW, barY + barH + 18)
    ctx.textAlign = 'left'

    return await canvas.encode('png')
}

function roundRect(ctx, x, y, w, h, r) {
    if (typeof r === 'number') r = [r, r, r, r]
    const [tl, tr, br, bl] = r
    ctx.beginPath()
    ctx.moveTo(x + tl, y)
    ctx.lineTo(x + w - tr, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr)
    ctx.lineTo(x + w, y + h - br)
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
    ctx.lineTo(x + bl, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl)
    ctx.lineTo(x, y + tl)
    ctx.quadraticCurveTo(x, y, x + tl, y)
    ctx.closePath()
}

function truncate(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text
    while (ctx.measureText(text + '…').width > maxW && text.length > 0) text = text.slice(0, -1)
    return text + '…'
}
