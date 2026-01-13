import fetch from 'node-fetch'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

let isSending = false 

let handler = async (m, { conn, text, command }) => {
  const channelId = '120363407318005025@newsletter' // ID channel kamu
  if (isSending) return m.reply('⏳ Tunggu dulu, sedang mengirim ke channel...')
  isSending = true

  try {
    if (!text) return m.reply(`Masukkan judul lagu!\n\nContoh:\n.${command} dj 30 detik`)

    const res = await fetch(`https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(text)}`)
    const json = await res.json()
    if (!json.success || !json.result?.downloadUrl) throw new Error('Gagal mengambil data dari API.')

    const { title, channel, duration, cover, url } = json.result.metadata
    const audioUrl = json.result.downloadUrl

    const audioBuffer = Buffer.from(await (await fetch(audioUrl)).arrayBuffer())

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const timestamp = Date.now()
    const inputPath = path.join(tmpDir, `input_${timestamp}.mp3`)
    const outputPath = path.join(tmpDir, `output_${timestamp}.opus`)
    fs.writeFileSync(inputPath, audioBuffer)
  
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c:a', 'libopus',
        '-b:a', '192k',
        '-ar', '48000',
        '-ac', '2',
        '-vbr', 'on',
        '-compression_level', '10',
        '-application', 'audio',
        '-f', 'opus',
        '-y', outputPath
      ])

      let stderr = ''
      ffmpeg.stderr.on('data', (data) => (stderr += data.toString()))
      ffmpeg.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`ffmpeg gagal convert: ${stderr}`))
      })
    })

    const opusBuffer = fs.readFileSync(outputPath)
   
    await conn.sendMessage(channelId, {
      audio: opusBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        externalAdReply: {
          title,
          body: channel,
          thumbnailUrl: cover,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { ephemeralExpiration: 0, quoted: null })

    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)

    await m.reply(`✅ Lagu berhasil dikirim ke saluran!\n\n📀 *${title}*\n🎤 ${channel}\n⏱️ ${duration}`)

  } catch (e) {
    console.error('❌ playch PTT Error:', e)
    await m.reply('❌ Gagal mengirim audio ke saluran (VN). Pastikan ffmpeg terinstall dan file tidak korup.')
  } finally {
    isSending = false
  }
}

handler.help = ['playch']
handler.tags = ['downloader']
handler.command = /^playch$/i
handler.limit = false
handler.owner = true

export default handler