import axios from 'axios'
import { sticker } from '../../lib/sticker.js'

function emojiToNotoCodepoint(emoji) {
    return [...emoji]
        .map(c => c.codePointAt(0).toString(16).toLowerCase())
        .filter(cp => cp !== 'fe0f')
        .join('_')
}

function notoUrl(emoji) {
    return `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u${emojiToNotoCodepoint(emoji)}.png`
}

const EMOJI_REGEX = /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?|\p{Emoji}\uFE0F?|[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)/gu

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Kirim emoji:\n*${usedPrefix + command} 😂*`)

    const matches = [...text.matchAll(EMOJI_REGEX)]
    if (!matches.length) return m.reply('❌ Tidak ada emoji yang terdeteksi!')

    const emoji = matches[0][0]

    await m.react('🕜')

    try {
        const res = await axios.get(notoUrl(emoji), {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            maxRedirects: 5,
            validateStatus: s => s === 200
        })

        const buf = Buffer.from(res.data)
        const stiker = await sticker(buf, false, global.stickpack || global.namebot || 'Sticker Pack', global.stickauth || global.author || 'Bot')

        if (stiker) {
            await conn.sendFile(m.chat, stiker, '', '', m)
            await m.react('✅')
        } else {
            await m.react('❌')
        }

    } catch (e) {
        console.error('emojistick error:', e.message)
        await m.react('❌')
        throw `❌ Emoji tidak ditemukan di noto!\nCoba emoji lain.`
    }
}

handler.help = ['emojistick <emoji>']
handler.tags = ['sticker']
handler.command = /^emojistick$/i
handler.limit = true

export default handler