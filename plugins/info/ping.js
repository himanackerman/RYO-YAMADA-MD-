/*
creator : hilman 
ryo Yamada md
follow my channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import os from 'os'
import moment from 'moment-timezone'
import { performance } from 'perf_hooks'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import axios from 'axios'

const ASSETS_DIR = join(process.cwd(), 'assets', 'pingcanvas')
const FONTS_DIR = join(ASSETS_DIR, 'fonts')

const FONT_LIST = [
    {
        url: 'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/hinted/ttf/NotoSans-Regular.ttf',
        file: 'NotoSans-Regular.ttf',
        family: 'NotoSans'
    },
    {
        url: 'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/hinted/ttf/NotoSans-Bold.ttf',
        file: 'NotoSans-Bold.ttf',
        family: 'NotoSansBold'
    },
    {
        url: 'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansMono/hinted/ttf/NotoSansMono-Regular.ttf',
        file: 'NotoSansMono-Regular.ttf',
        family: 'NotoSansMono'
    },
    {
        url: 'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansMono/hinted/ttf/NotoSansMono-Bold.ttf',
        file: 'NotoSansMono-Bold.ttf',
        family: 'NotoSansMonoBold'
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
    for (const f of FONT_LIST) {
        const dest = join(FONTS_DIR, f.file)
        if (!existsSync(dest)) await writeFile(dest, await dlBuf(f.url))
        GlobalFonts.registerFromPath(dest, f.family)
    }
}

let handler = async (m, { conn }) => {
    const old = performance.now()
    await conn.sendPresenceUpdate('composing', m.chat)
    const speed = (performance.now() - old).toFixed(2)
    const uptime = process.uptime() * 1000

    const format = ms => {
        const h = Math.floor(ms / 3600000)
        const min = Math.floor(ms / 60000) % 60
        const s = Math.floor(ms / 1000) % 60
        return `${h}h ${min}m ${s}s`
    }

    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1)
    const cpu = os.cpus()[0].model
    const cpuWords = cpu.split(' ')
    const cpuLine1 = cpuWords.slice(0, 4).join(' ')
    const cpuLine2 = cpuWords.slice(4).join(' ')

    const users = Object.keys(global.db.data.users || {}).length
    const groups = Object.keys(global.db.data.chats || {}).filter(v => v.endsWith('@g.us')).length
    const premium = Object.values(global.db.data.users || {}).filter(v => v.premiumTime > Date.now()).length
    const time = moment.tz('Asia/Jakarta').format('DD MMM YYYY • HH:mm:ss')
    const botName = String(global.namebot || 'Bot').toUpperCase()

    await prepFonts()

    const canvas = createCanvas(1600, 900)
    const ctx = canvas.getContext('2d')

    const bg = ctx.createLinearGradient(0, 0, 1600, 900)
    bg.addColorStop(0, '#09090f')
    bg.addColorStop(0.5, '#12071f')
    bg.addColorStop(1, '#031525')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1600, 900)

    function roundRect(x, y, w, h, r, fill, stroke) {
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
        if (fill) { ctx.fillStyle = fill; ctx.fill() }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke() }
    }

    function card(x, y, w, h, color) {
        roundRect(x, y, w, h, 30, 'rgba(10,10,15,.72)', color)
    }

    ctx.shadowColor = '#00e5ff'
    ctx.shadowBlur = 20
    ctx.fillStyle = '#fff'
    ctx.font = `bold 56px NotoSansMonoBold`
    ctx.fillText(`${botName} SYSTEM`, 60, 90)

    ctx.shadowBlur = 0
    ctx.fillStyle = '#94a3b8'
    ctx.font = `22px NotoSansMono`
    ctx.fillText(time, 60, 130)

    card(60, 190, 450, 180, '#00e5ff')
    ctx.fillStyle = '#00e5ff'
    ctx.font = `bold 28px NotoSansMonoBold`
    ctx.fillText('SPEED', 90, 250)
    ctx.fillStyle = '#fff'
    ctx.font = `bold 46px NotoSansMonoBold`
    ctx.fillText(`${speed} ms`, 90, 330)

    card(575, 190, 450, 180, '#a855f7')
    ctx.fillStyle = '#c084fc'
    ctx.font = `bold 28px NotoSansMonoBold`
    ctx.fillText('RAM', 605, 250)
    ctx.fillStyle = '#fff'
    ctx.font = `bold 46px NotoSansMonoBold`
    ctx.fillText(`${ramUsed} MB`, 605, 330)

    card(1090, 190, 450, 180, '#ff4fd8')
    ctx.fillStyle = '#ff4fd8'
    ctx.font = `bold 28px NotoSansMonoBold`
    ctx.fillText('UPTIME', 1120, 250)
    ctx.fillStyle = '#fff'
    ctx.font = `bold 46px NotoSansMonoBold`
    ctx.fillText(format(uptime), 1120, 330)

    card(60, 430, 720, 220, '#00e5ff')
    ctx.fillStyle = '#00e5ff'
    ctx.font = `bold 28px NotoSansMonoBold`
    ctx.fillText('CPU', 95, 490)
    ctx.fillStyle = '#fff'
    ctx.font = `bold 28px NotoSansMonoBold`
    ctx.fillText(cpuLine1, 95, 550)
    ctx.fillText(cpuLine2, 95, 595)
    ctx.fillStyle = '#94a3b8'
    ctx.font = `22px NotoSansMono`
    ctx.fillText(`${os.cpus().length} CORES`, 95, 640)

    card(820, 430, 720, 220, '#ffd93d')
    ctx.fillStyle = '#ffd93d'
    ctx.font = `bold 28px NotoSansMonoBold`
    ctx.fillText('MEMORY', 855, 490)
    ctx.fillStyle = '#fff'
    ctx.font = `bold 46px NotoSansMonoBold`
    ctx.fillText(`${ramTotal} GB`, 855, 560)
    ctx.fillStyle = '#94a3b8'
    ctx.font = `22px NotoSansMono`
    ctx.fillText('SYSTEM MEMORY', 855, 620)

    card(60, 710, 1480, 150, '#22c55e')
    ctx.fillStyle = '#22c55e'
    ctx.font = `bold 28px NotoSansMonoBold`
    ctx.fillText('DATABASE', 95, 775)
    ctx.fillStyle = '#fff'
    ctx.font = `bold 36px NotoSansMonoBold`
    ctx.fillText(`USERS ${users}  •  GROUPS ${groups}  •  PREMIUM ${premium}`, 95, 835)

    const image = canvas.toBuffer('image/png')

    const caption = `— ${global.namebot} —

❀ Speed : ${speed} ms
❀ Runtime : ${format(uptime)}
❀ RAM : ${ramUsed} MB
❀ Users : ${users}
❀ Groups : ${groups}
❀ Premium : ${premium}`.trim()

    await conn.sendMessage(m.chat, { image, caption }, { quoted: m })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping|speed)$/i

export default handler