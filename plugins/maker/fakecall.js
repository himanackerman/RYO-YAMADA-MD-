/**
‎✧ Name   : fake call ios
‎✧ Creator   : Rin imup/princes
‎✧ Category : Canvas
‎✧ sumber : https://whatsapp.com/channel/0029Vb6EHtR5Ui2gHMW9zX2x
‎✧ *Note* : Jangan hapus wm ya kalo hapus liat aja permainan nya pasti lu nyesel😘,kalo masih kurang bagus sesuikan lagi ya udah support emoji apple
‎**/

import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) return m.reply(`*Format salah!*\n\nKirim foto atau reply foto dengan caption:\n.${command} Nama Kamu | 01:00:39`)
    if (!text) return m.reply(`*Format salah!*\n\nMasukkan nama dan durasi!\nContoh:\n.${command} my heart ❤️ | 01:00:39`)

    const [namaPayload, durasiPayload] = text.split('|')
    if (!namaPayload || !durasiPayload) return m.reply(`*Format salah!*\n\nPastikan menggunakan pemisah tanda garis (|)\nContoh:\n.${command} my heart ❤️ | 01:00:39`)

    const txtNama = namaPayload.trim()
    const txtDurasi = durasiPayload.trim()

    try {
        await m.react('🕜')

        const ASSETS_DIR = join(process.cwd(), 'assets', 'wacall_meme')
        const FONTS_DIR = join(ASSETS_DIR, 'fonts')
        const BG_LOCAL = join(ASSETS_DIR, 'template_call.png')
        const TMP_DIR = join(process.cwd(), 'tmp')

        const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/353dc125-a39c-4d27-9ba5-9ec7dfa6624a.png'
        const APPLE_EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json'
        const APPLE_EMOJI_JSON_LOCAL = join(FONTS_DIR, 'emoji-apple-image.json')

        await mkdir(FONTS_DIR, { recursive: true })
        await mkdir(TMP_DIR, { recursive: true })

        const fontConfigs = [
            { url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2', name: 'Roboto-Bold.ttf', family: 'RobotoWA' },
            { url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2', name: 'Roboto-Regular.ttf', family: 'RobotoWA' }
        ]

        for (const f of fontConfigs) {
            const fPath = join(FONTS_DIR, f.name)
            if (!existsSync(fPath)) {
                const fRes = await axios.get(f.url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
                await writeFile(fPath, Buffer.from(fRes.data))
            }
            GlobalFonts.registerFromPath(fPath, f.family)
        }

        if (!existsSync(APPLE_EMOJI_JSON_LOCAL)) {
            const eRes = await axios.get(APPLE_EMOJI_JSON_URL, { responseType: 'arraybuffer' })
            await writeFile(APPLE_EMOJI_JSON_LOCAL, Buffer.from(eRes.data))
        }
        const appleEmojiMap = JSON.parse(readFileSync(APPLE_EMOJI_JSON_LOCAL, 'utf-8'))
        const emojiCache = new Map()

        if (!existsSync(BG_LOCAL)) {
            const res = await axios.get(BG_URL, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
            await writeFile(BG_LOCAL, Buffer.from(res.data))
        }

        const avImg = await loadImage(await q.download())
        const bgImg = await loadImage(BG_LOCAL)

        const canvas = createCanvas(bgImg.width, bgImg.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

        const ppX = canvas.width / 2
        const ppY = canvas.height * 0.50
        const ppRadius = canvas.width * 0.22

        ctx.save()
        ctx.beginPath()
        ctx.arc(ppX, ppY, ppRadius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(avImg, ppX - ppRadius, ppY - ppRadius, ppRadius * 2, ppRadius * 2)
        ctx.restore()

        const EMOJI_DETECTOR = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u

        function emojiToUnicode(emoji) {
            return [...emoji].map(c => c.codePointAt(0).toString(16).padStart(4, '0')).join('-')
        }

        async function getEmojiImage(emoji) {
            if (emojiCache.has(emoji)) return emojiCache.get(emoji)
            const base = emojiToUnicode(emoji)
            const variants = [
                base,
                base.replace(/-fe0f/gi, ''),
                `${base.replace(/-fe0f/gi, '')}-fe0f`,
                base.toUpperCase(),
                base.replace(/-fe0f/gi, '').toUpperCase(),
                base.replace(/-fe0f/gi, '').toUpperCase() + '-FE0F',
            ]
            let b64 = null
            for (const v of variants) {
                if (appleEmojiMap[v]) { b64 = appleEmojiMap[v]; break }
            }
            if (!b64) return null
            const img = await loadImage(Buffer.from(b64, 'base64'))
            emojiCache.set(emoji, img)
            return img
        }

        function parseTextAndEmojis(textStr) {
            const tokens = []
            const chars = [...textStr]
            let currentText = ''
            for (let i = 0; i < chars.length; i++) {
                if (EMOJI_DETECTOR.test(chars[i])) {
                    if (currentText) { tokens.push({ type: 'text', value: currentText }); currentText = '' }
                    let emojiVal = chars[i]
                    if (chars[i + 1] === '\uFE0F') { emojiVal += chars[i + 1]; i++ }
                    tokens.push({ type: 'emoji', value: emojiVal })
                } else {
                    currentText += chars[i]
                }
            }
            if (currentText) tokens.push({ type: 'text', value: currentText })
            return tokens
        }

        function measureTextCustom(context, tokens, fontSize) {
            let totalWidth = 0
            for (const token of tokens) {
                totalWidth += token.type === 'emoji' ? fontSize * 1.05 : context.measureText(token.value).width
            }
            return totalWidth
        }

        async function drawTextWithEmojisCenter(context, textStr, yPos, fontSize, fontString) {
            context.font = fontString
            context.textBaseline = 'top'
            const tokens = parseTextAndEmojis(textStr)
            const totalWidth = measureTextCustom(context, tokens, fontSize)
            let currentX = (canvas.width / 2) - (totalWidth / 2)
            for (const token of tokens) {
                if (token.type === 'emoji') {
                    const emojiSize = fontSize * 1.05
                    const img = await getEmojiImage(token.value)
                    if (img) {
                        context.drawImage(img, currentX, yPos + (fontSize - emojiSize) / 2, emojiSize, emojiSize)
                    } else {
                        context.fillText(token.value, currentX, yPos)
                    }
                    currentX += emojiSize
                } else {
                    context.fillText(token.value, currentX, yPos)
                    currentX += context.measureText(token.value).width
                }
            }
        }

        ctx.fillStyle = '#FFFFFF'
        await drawTextWithEmojisCenter(ctx, txtNama, 75, 42, `700 42px RobotoWA, sans-serif`)

        ctx.fillStyle = '#C5C5C5'
        await drawTextWithEmojisCenter(ctx, txtDurasi, 133, 35, `400 35px RobotoWA, sans-serif`)

        const outBuf = await canvas.encode('png')
        const outPath = join(TMP_DIR, `wacall-${Date.now()}.png`)
        await writeFile(outPath, outBuf)

        await conn.sendFile(m.chat, outPath, 'wacall.png', '', m)

        unlink(outPath).catch(() => {})

    } catch (e) {
        console.error(e)
        m.reply('❌ Gagal membuat fake Call\n\n' + e.message)
    }
}

handler.help = ['fakecall']
handler.tags = ['maker']
handler.command = ['fakecall']

export default handler