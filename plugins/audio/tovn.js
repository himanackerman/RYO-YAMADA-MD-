import { downloadContentFromMessage } from 'baileys'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'

const getRandom = (ext) =>
    `${Math.floor(Math.random() * 10000)}${ext}`

const convertToOpus = (inPath, outPath) =>
    new Promise((resolve, reject) => {
        exec(
            `ffmpeg -y -i "${inPath}" -vn -c:a libopus "${outPath}"`,
            (err, _, stderr) => {
                if (err) {
                    console.error('[tovn opus]', stderr)
                    reject(err)
                } else {
                    resolve()
                }
            }
        )
    })

let handler = async (m, { conn, usedPrefix, command }) => {
    const quoted = m.quoted

    if (!quoted) {
        return m.reply(
            `Balas video atau audio dengan perintah *${usedPrefix + command}*`
        )
    }

    const mime = quoted.mimetype || ''
    const isVideo = mime.startsWith('video/')
    const isAudio = mime.startsWith('audio/')

    if (!isVideo && !isAudio) {
        return m.reply(
            '❗ Format tidak didukung!\n' +
            'Hanya bisa mengubah video atau audio menjadi Voice Note (PTT).'
        )
    }

    await m.react('🕒')

    const msgType = quoted.mtype?.replace('Message', '') || mime.split('/')[0]

    try {
        const stream = await downloadContentFromMessage(
            quoted.msg || quoted,
            msgType
        )

        const chunks = []
        for await (const chunk of stream) {
            chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)

        const inExt = isVideo ? '.mp4' : '.mp3'
        const inPath = join(tmpdir(), getRandom(inExt))
        const outPath = join(tmpdir(), getRandom('.ogg'))

        try {
            writeFileSync(inPath, buffer)

            await convertToOpus(inPath, outPath)

            const opusBuffer = readFileSync(outPath)

            const waveform = Buffer
                .alloc(64)
                .map(() => Math.floor(Math.random() * 100))

            await conn.sendMessage(
                m.chat,
                {
                    audio: opusBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    waveform
                },
                { quoted: m }
            )

            await m.react('✅')
        } finally {
            try {
                unlinkSync(inPath)
            } catch {}
            try {
                unlinkSync(outPath)
            } catch {}
        }

    } catch (e) {
        console.error('[tovn]', e)
        await m.react('❌')
        await m.reply(`❌ Terjadi kesalahan: ${e.message}`)
    }
}

handler.help = ['tovn']
handler.tags = ['audio']
handler.command = /^(tovn|toptt)$/i
handler.limit = true

export default handler