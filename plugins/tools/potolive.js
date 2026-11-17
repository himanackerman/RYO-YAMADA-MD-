import { downloadContentFromMessage, prepareWAMessageMedia, generateWAMessageFromContent } from 'baileys'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import sharp from 'sharp'

const handler = async (m, { conn, args, text, command, usedPrefix }) => {
const isCreator = global.owner.includes(m.sender)
const isPrem = global.db.data.users[m.sender]?.premium || false

const checkLimit = () => {
    const user = global.db.data.users[m.sender]
    if (!user) return true
    if (isPrem || isCreator) return false
    return (user.limit || 0) <= 0
}

if (checkLimit()) {
    return m.reply(global.mess?.limit || 'Limit Anda habis!')
}

const q = m.quoted ? m.quoted : m
const mime = (q.msg || q).mimetype || ''

if (!mime.startsWith('video/')) {
    return m.reply('Mana videonya? Reply video dulu yaa~')
}

if (!isPrem && !isCreator) {
    global.db.data.users[m.sender].limit = (global.db.data.users[m.sender].limit || 10) - 1
}

await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

try {
    const stream = await downloadContentFromMessage(q.msg || q, 'video')
    let videoBuffer = Buffer.from([])

    for await (const chunk of stream) {
        videoBuffer = Buffer.concat([videoBuffer, chunk])
    }

    const tmpVideo = `/tmp/lv_video_${Date.now()}.mp4`
    const tmpThumb = `/tmp/lv_thumb_${Date.now()}.jpg`

    fs.writeFileSync(tmpVideo, videoBuffer)

    let videoDuration = 0

    await new Promise((resolve, reject) => {
        ffmpeg(tmpVideo)
            .on('codecData', (data) => {
                if (data && data.duration) {
                    const parts = data.duration.split(':')
                    if (parts.length === 3) {
                        videoDuration = Math.ceil(
                            parseFloat(parts[0]) * 3600 +
                            parseFloat(parts[1]) * 60 +
                            parseFloat(parts[2])
                        )
                    }
                }
            })
            .outputOptions(['-vframes 1', '-q:v 2'])
            .output(tmpThumb)
            .on('end', resolve)
            .on('error', reject)
            .run()
    })

    const thumbBuffer = fs.readFileSync(tmpThumb)

    const miniThumb = await sharp(thumbBuffer)
        .resize(100, 100, { fit: 'inside' })
        .jpeg({ quality: 50 })
        .toBuffer()

    if (fs.existsSync(tmpVideo)) fs.unlinkSync(tmpVideo)
    if (fs.existsSync(tmpThumb)) fs.unlinkSync(tmpThumb)

    const imageMedia = await prepareWAMessageMedia(
        { image: thumbBuffer },
        { upload: conn.waUploadToServer }
    )

    const videoMedia = await prepareWAMessageMedia(
        { video: videoBuffer },
        { upload: conn.waUploadToServer }
    )

    const photoMsg = generateWAMessageFromContent(
        m.chat,
        {
            imageMessage: {
                ...imageMedia.imageMessage,
                jpegThumbnail: miniThumb,
                contextInfo: {
                    pairedMediaType: 5,
                    statusSourceType: 0
                }
            }
        },
        {}
    )

    await conn.relayMessage(m.chat, photoMsg.message, {
        messageId: photoMsg.key.id
    })

    await conn.relayMessage(
        m.chat,
        {
            videoMessage: {
                ...videoMedia.videoMessage,
                seconds: videoDuration,
                jpegThumbnail: miniThumb,
                contextInfo: {
                    pairedMediaType: 6,
                    statusSourceType: 0
                }
            },
            messageContextInfo: {
                messageAssociation: {
                    associationType: 12,
                    parentMessageKey: photoMsg.key
                }
            }
        },
        {}
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

} catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('Gagal membuat foto live. Coba lagi nanti.')
}

}

handler.command = /^(potolive|photolive|fotolive)$/i
handler.help = ['potolive']
handler.tags = ['tools']
handler.limit = true
handler.premium = false

export default handler