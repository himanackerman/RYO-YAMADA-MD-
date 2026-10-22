import { downloadContentFromMessage } from 'baileys'

let handler = async (m, { conn, text }) => {
    const idch = '120363403952337689@newsletter'
    const who = m.sender

    const q = m.quoted ? m.quoted : m
    const mime = q.mimetype || ''

    if (!text && !mime) {
        throw `Contoh:\n.msgch Halo?\natau reply media`
    }

    await conn.sendMessage(m.chat, {
        react: { text: "⏳", key: m.key }
    }).catch(() => {})

    let url
    try {
        url = await conn.profilePictureUrl(who, 'image')
    } catch {
        url = null
    }

    let content = {}

    try {
        const msg = q.msg || q
        const type = Object.keys(msg)[0]

        // 🔥 STICKER → IMAGE (ANTI REJECT CHANNEL)
        if (type === 'stickerMessage') {
            let stream = await downloadContentFromMessage(msg.stickerMessage, 'sticker')
            let buffer = Buffer.from([])

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            content = {
                image: buffer,
                caption: text || ''
            }

        } else if (type === 'imageMessage') {
            let media = await q.download()
            content = { image: media, caption: text || '' }

        } else if (type === 'videoMessage') {
            let media = await q.download()
            content = { video: media, caption: text || '' }

        } else if (type === 'audioMessage') {
            let media = await q.download()
            content = {
                audio: media,
                mimetype: 'audio/mpeg',
                ptt: true
            }

        } else {
            content = { text: text || '' }
        }

    } catch (e) {
        console.error(e)
        content = { text: text || '[Gagal ambil media]' }
    }

    // clean preview
    content.contextInfo = {
        externalAdReplyOffOffOff: {
            thumbnailUrl: url,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false
        }
    }

    try {
        await conn.sendMessage(idch, content)

        await conn.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        }).catch(() => {})

        await m.reply('✅ Terkirim ke channel!')

    } catch (err) {
        console.error(err)

        await conn.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        }).catch(() => {})

        await m.reply('❌ Gagal kirim ke channel (format tidak didukung)')
    }
}

handler.help = ['msgch']
handler.tags = ['owner']
handler.command = /^msgch$/i
handler.premium = true
handler.mods = true

export default handler