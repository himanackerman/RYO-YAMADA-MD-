import {
    PassThrough
} from 'stream'
import ffmpeg from 'fluent-ffmpeg'

const musicAnnotation = [{
    shouldSkipConfirmation: true,
    embeddedContent: {
        embeddedMusic: {
            musicContentMediaId: '1522282592959121',
            songId: '4515912238639736',
            author: global.author,
            title: global.namebot,
            artworkDirectPath: '',
            artworkSha256: '',
            artworkEncSha256: '',
            artistAttribution: '',
            countryBlocklist: 'UlU=',
            isExplicit: false,
            artworkMediaKey: '',
            musicSongStartTimeInMs: '0',
            derivedContentStartTimeInMs: '0',
            overlapDurationInMs: '30000'
        }
    },
    embeddedAction: true
}]

let handler = async (m, {
    conn,
    text,
    usedPrefix
}) => {
    let args = (text || '')
        .split('|')
        .map(v => v.trim())
        .filter(v => v)

    let teks = ''
    let warna = ''
    let target = ''

    for (let v of args) {
        if (/chat\.whatsapp\.com\//i.test(v)) {
            target = v
        } else if (/@g\.us$/.test(v) || /^\d+$/.test(v)) {
            target = v
        } else if (!teks) {
            teks = v
        } else if (!warna) {
            warna = v
        }
    }

    let jid = m.chat

    if (target) {
        if (/chat\.whatsapp\.com\//i.test(target)) {
            const code = target.split('chat.whatsapp.com/')[1]

            try {
                const info = await conn.groupGetInviteInfo(code)
                jid = info.id
            } catch {
                return m.reply('Link grup tidak valid / bot belum join')
            }
        } else {
            jid = /^\d+$/.test(target)
                ? target + '@g.us'
                : target
        }
    }

    const quoted = m.quoted || m
    const mime = quoted.mimetype || ''
    const caption = quoted.caption || teks || ''

    const warnaMap = {
        biru: '#34B7F1',
        hijau: '#25D366',
        kuning: '#FFD700',
        jingga: '#FF8C00',
        merah: '#FF3B30',
        ungu: '#9C27B0',
        abu: '#9E9E9E',
        hitam: '#000000',
        putih: '#FFFFFF',
        cyan: '#00BCD4'
    }

    const colors = Object.values(warnaMap)

    const bgColor = warna
        ? warnaMap[warna.toLowerCase()] || warnaMap.biru
        : colors[Math.floor(Math.random() * colors.length)]

    if (!caption && !m.quoted) {
        return m.reply(`
Example:

${usedPrefix}swgc halo

Reply foto/video/audio/sticker:
${usedPrefix}swgc
        `.trim())
    }

    if (/image/i.test(mime)) {
        const buffer = await quoted.download()

        await conn.sendMessage(jid, {
            image: buffer,
            caption,
            contextInfo: {
                isGroupStatus: true
            },
            annotations: musicAnnotation
        })

        return m.reply(`Succes upload status!\nGroupID: ${jid}`)
    }

    if (/video/i.test(mime)) {
        const buffer = await quoted.download()

        await conn.sendMessage(jid, {
            video: buffer,
            caption,
            contextInfo: {
                isGroupStatus: true
            },
            annotations: musicAnnotation
        })

        return m.reply(`Succes upload status!\nGroupID: ${jid}`)
    }

    if (/audio/i.test(mime)) {
        const buffer = await quoted.download()
        const vn = await toVN(buffer)

        await conn.sendMessage(jid, {
            audio: vn,
            ptt: true,
            mimetype: 'audio/ogg; codecs=opus',
            contextInfo: {
                isGroupStatus: true
            },
            annotations: musicAnnotation
        })

        return m.reply(`Succes upload status!\nGroupID: ${jid}`)
    }

    if (/sticker/i.test(mime)) {
        const buffer = await quoted.download()

        await conn.sendMessage(jid, {
            sticker: buffer,
            contextInfo: {
                isGroupStatus: true
            },
            annotations: musicAnnotation
        })

        return m.reply(`Succes upload status!\nGroupID: ${jid}`)
    }

    await (async () => {
        const argbMap = {
            biru: 4294967040,
            hijau: 4278255360,
            kuning: 4294967040,
            jingga: 4294901760,
            merah: 4294901760,
            ungu: 4283760640,
            abu: 4288716960,
            hitam: 4278190080,
            putih: 4294967295,
            cyan: 4278255615
        }

        const backgroundArgb = argbMap[warna.toLowerCase()] || 4280669030

        const message = {
            extendedTextMessage: {
                text: caption,
                textArgb: 4294967040,
                backgroundArgb,
                font: 5,
                previewType: 0,
                contextInfo: {
                    forwardingScore: 0,
                    featureEligibilities: {
                        canBeReshared: true,
                        canReceiveMultiReact: true
                    },
                    statusSourceType: 4,
                    statusAttributions: [
                        {
                            type: 10
                        }
                    ],
                    statusAudienceMetadata: {
                        audienceType: 1
                    }
                },
                inviteLinkGroupTypeV2: 0
            }
        }

        await conn.relayMessage(
            jid,
            {
                messageContextInfo: {
                    messageSecret: 'BrRzGQ6/B0ddqBuasejEf+rJKLQ2pauxHtAw1nIMPvw='
                },
                groupStatusMessageV2: {
                    message
                }
            },
            {}
        )
    })()

    return m.reply(`Succes upload status!\nGroupID: ${jid}`)
}

async function toVN(buffer) {
    return new Promise((resolve, reject) => {
        const input = new PassThrough()
        const output = new PassThrough()
        const chunks = []

        input.end(buffer)

        ffmpeg(input)
            .noVideo()
            .audioCodec('libopus')
            .format('ogg')
            .on('error', reject)
            .on('end', () => resolve(Buffer.concat(chunks)))
            .pipe(output)

        output.on('data', c => chunks.push(c))
    })
}

handler.command = ['swgc', 'upswgc']
handler.help = ['swgc']
handler.tags = ['group']
handler.owner = false
handler.group = true
handler.admin = true

export default handler