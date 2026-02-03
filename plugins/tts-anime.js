import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'
import util from 'util'
import TTSQueue from '../lib/tts-queue.js'

const execAsync = util.promisify(exec)

function getWaveformFromPCM(pcmData, samples = 64) {
    const blockSize = Math.floor(pcmData.length / samples)
    const waveform = []

    for (let i = 0; i < samples; i++) {
        const start = i * blockSize
        const end = start + blockSize
        let sum = 0

        for (let j = start; j < end; j++) {
            sum += Math.abs(pcmData[j])
        }

        const avg = sum / blockSize
        waveform.push(Math.min(100, Math.floor(avg / 20)))
    }

    return waveform
}

async function getDuration(file) {
    const { stdout } = await execAsync(
        `ffprobe -i "${file}" -show_entries format=duration -v quiet -of csv="p=0"`
    )
    return Math.ceil(parseFloat(stdout))
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Gunakan:\n${usedPrefix + command} <teks bahasa Jepang>`)
    }

    if (!/[\u3040-\u30ff\u4e00-\u9faf]/.test(text)) {
        return m.reply('Hanya mendukung bahasa Jepang')
    }

    const tts = new TTSQueue()

    try {
        const result = await tts.simpleTTS(
            text,
            '春乌拉拉 Haru Urara',
            '日本語',
            1.0,
            false
        )

        const audioData = result?.output?.data?.find(
            v => typeof v === 'object' && v.url
        )

        if (!audioData?.url) {
            return m.reply('Gagal mengambil audio')
        }

        const wavPath = path.join(tmpdir(), `tts_${Date.now()}.wav`)
        const opusPath = path.join(tmpdir(), `tts_${Date.now()}.ogg`)
        const pcmPath = path.join(tmpdir(), `tts_${Date.now()}.pcm`)

        const res = await axios.get(audioData.url, {
            responseType: 'arraybuffer'
        })
        fs.writeFileSync(wavPath, res.data)

        await execAsync(
            `ffmpeg -y -i "${wavPath}" -ar 48000 -ac 1 -c:a libopus -b:a 64k "${opusPath}"`
        )

        await execAsync(
            `ffmpeg -y -i "${opusPath}" -f s16le -acodec pcm_s16le -ar 48000 -ac 1 "${pcmPath}"`
        )

        const pcmData = fs.readFileSync(pcmPath)
        const waveform = getWaveformFromPCM(pcmData, 64)
        const duration = await getDuration(opusPath)
        const audioBuffer = fs.readFileSync(opusPath)

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            waveform,
            audioDuration: duration
        }, { quoted: m })

        fs.unlinkSync(wavPath)
        fs.unlinkSync(opusPath)
        fs.unlinkSync(pcmPath)

    } catch (err) {
        console.error('[TTS ERROR]', err)
        await m.reply('Gagal generate TTS')
    }
}

handler.help = ['tts <teks jepang>']
handler.tags = ['voice']
handler.command = /^tts$/i
handler.limit = true

export default handler