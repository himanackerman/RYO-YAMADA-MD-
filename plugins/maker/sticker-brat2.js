/* 
fitur : brat canvas
source : https://whatsapp.com/channel/0029Vb67i65Fi8xX7rOtIc2S
note : ga bagus si cuman gabut doang bjier
*/

import { createCanvas } from '@napi-rs/canvas'
import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Kirimkan teks.\nContoh: ${usedPrefix + command} ini teks`

    const size = 512
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    let fontSize = 100
    ctx.font = `${fontSize}px Arial`

    let words = text.toLowerCase().split(' ')
    let lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
        let word = words[i]
        let width = ctx.measureText(currentLine + " " + word).width
        if (width < size - 40) {
            currentLine += " " + word
        } else {
            lines.push(currentLine)
            currentLine = word
        }
    }
    lines.push(currentLine)

    let totalHeight = lines.length * (fontSize + 10)
    let startY = (size - totalHeight) / 2 + (fontSize / 2)

    for (let i = 0; i < lines.length; i++) {
        while (ctx.measureText(lines[i]).width > size - 40 && fontSize > 20) {
            fontSize -= 5
            ctx.font = `${fontSize}px Arial`
        }
        ctx.fillText(lines[i], size / 2, startY + (i * (fontSize + 10)))
    }

    ctx.font = '15px Arial'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(' ', size / 2, size - 10)

    try {
        const buffer = canvas.toBuffer('image/png')
        const stickerBuffer = await sticker(buffer, false, 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ', 'ʙy ʜɪʟᴍᴀɴ')

        if (!stickerBuffer) throw 'Gagal mengonversi canvas ke stiker'

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    } catch (e) {
        console.error(e)
        m.reply(typeof e === 'string' ? e : 'Terjadi kesalahan saat membuat stiker')
    }
}

handler.help = ['bratcanvas <teks>']
handler.tags = ['maker']
handler.command = /^(bratc|bratcanvas)$/i

export default handler