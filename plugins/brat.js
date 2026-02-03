import { Sticker } from 'wa-sticker-formatter'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (m.quoted && m.quoted.text) {
        text = m.quoted.text || 'hai'
    } else if (text) {
        text = text
    } else if (!text && !m.quoted) return m.reply('reply / masukan teks')

    try {       
        await m.react('🕒')

        const response = `https://aqul-brat.hf.space?text=${encodeURIComponent(text)}`
        let stiker = await createSticker(
            false,
            response,
            global.stickpack || global.namebot || 'Sticker Pack',
            global.stickauth || global.author || 'Bot',
            10
        )

        if (stiker) {
            await conn.sendFile(
                m.chat,
                stiker,
                '',
                '',
                global.fstatus
            )
            await m.react('✅')
        } else {
            await m.react('❌')
        }
    } catch (e) {
        await m.react('❌')
        throw e
    }
}

handler.help = ['brat <text>']
handler.tags = ['sticker']
handler.command = /^(brat)$/i
handler.limit = true
handler.register = false
handler.group = false

export default handler

async function createSticker(img, url, packName, authorName, quality) {
    let stickerMetadata = {
        type: 'crop',
        pack: packName,
        author: authorName,
        quality
    }
    return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}