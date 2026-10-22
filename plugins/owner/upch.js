import {
    prepareWAMessageMedia,
    generateMessageIDV2,
    proto,
    downloadContentFromMessage
} from 'baileys'

import {
    writeFileSync,
    readFileSync,
    unlinkSync
} from 'fs'

import { join } from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'

const getRandom = (ext) =>
    `${Math.floor(Math.random() * 10000)}${ext}`

const convertToOpus = (inPath, outPath) =>
    new Promise((resolve, reject) => {
        exec(
            `ffmpeg -y -i "${inPath}" -c:a libopus "${outPath}"`,
            (err, _, stderr) => {
                if (err) {
                    console.error('[upch opus]', stderr)
                    reject(err)
                } else {
                    resolve()
                }
            }
        )
    })

const handler = async (m, { conn, text }) => {
    const caption = (text || '').trim()
    const quoted = m.quoted

    if (!quoted) {
        return m.reply(
            'Balas media yang ingin diupload ke channel!\n\n' +
            'Support: gambar, video, audio'
        )
    }

    const mime = quoted.mimetype || ''

    const isImage = mime.startsWith('image/')
    const isVideo = mime.startsWith('video/')
    const isAudio = mime.startsWith('audio/')

    if (!isImage && !isVideo && !isAudio) {
        return m.reply(
            '❗ Format tidak didukung!\n' +
            'Hanya gambar, video, dan audio.'
        )
    }

    const channelId = global.chId

    await m.reply(' Mengupload ke channel...')
    await m.react('🕒')

    try {
        const msgType =
            quoted.mtype?.replace('Message', '') ||
            mime.split('/')[0]

        const stream = await downloadContentFromMessage(
            quoted.msg || quoted,
            msgType
        )

        const chunks = []

        for await (const chunk of stream) {
            chunks.push(chunk)
        }

        const buffer = Buffer.concat(chunks)

        let mediaObj = {}
        let mediatype = ''

        if (isImage) {
            mediaObj = {
                image: buffer,
                caption
            }
            mediatype = 'image'
        }

        if (isVideo) {
            mediaObj = {
                video: buffer,
                caption,
                mimetype: mime
            }
            mediatype = 'video'
        }

        if (isAudio) {
            const inPath = join(
                tmpdir(),
                getRandom('.mp3')
            )

            const outPath = join(
                tmpdir(),
                getRandom('.ogg')
            )

            try {
                writeFileSync(inPath, buffer)

                await convertToOpus(
                    inPath,
                    outPath
                )

                const opusBuffer = readFileSync(outPath)

                const waveform = Buffer
                    .alloc(64)
                    .map(() => Math.floor(Math.random() * 100))

                mediaObj = {
                    audio: opusBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    waveform
                }
                mediatype = 'audio'

            } finally {
                try {
                    unlinkSync(inPath)
                } catch {}

                try {
                    unlinkSync(outPath)
                } catch {}
            }
        }

        const msg = await prepareWAMessageMedia(
            mediaObj,
            {
                upload: conn.waUploadToServer,
                jid: channelId
            }
        )

        const node = {
            tag: 'message',
            attrs: {
                to: channelId,
                id: generateMessageIDV2(),
                type: 'media'
            },
            content: [
                {
                    tag: 'plaintext',
                    attrs: {
                        mediatype
                    },
                    content: await proto.Message.encode(msg).finish()
                }
            ]
        }

        await conn.query(node)

        await m.reply(' Berhasil diupload ke channel!')
        await m.react('✅')

    } catch (e) {
        console.error('[upch]', e)
        await m.react('❌')
        await m.reply(`❌ Gagal upload: ${e.message}`)
    }
}

handler.command = /^upch$/i
handler.help = ['upch <caption>']
handler.tags = ['owner']
handler.rowner = true

export default handler