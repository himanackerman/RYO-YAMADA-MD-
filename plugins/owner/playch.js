// coba ini bang
import axios from 'axios'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

function isYoutubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} swim chase atlantic`)

  // ganti id channel
  const idsal = '120363403952337689@newsletter'

  let tempInput, tempOutput

  try {

    await m.reply('wait')

    let v

    if (isYoutubeUrl(text)) {
      const search = await yts({ videoId: text.split('v=')[1] || text.split('/').pop() })
      v = search
    } else {
      const search = await yts(text)
      v = search.videos[0]
    }

    if (!v) throw 'Lagu tidak ditemukan'

    const api = `https://api.nexray.web.id/downloader/ytmp3?url=${encodeURIComponent(v.url)}`
    const { data } = await axios.get(api)

    if (!data.status) throw 'Audio tidak ditemukan'

    const audioUrl = data.result.url

    const audioRes = await axios.get(audioUrl, {
      responseType: 'arraybuffer'
    })

    tempInput = path.join(os.tmpdir(), `${Date.now()}_input.mp3`)
    tempOutput = path.join(os.tmpdir(), `${Date.now()}_output.opus`)

    fs.writeFileSync(tempInput, Buffer.from(audioRes.data))

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', tempInput,
        '-map_metadata', '-1',
        '-vn',
        '-ac', '1',
        '-ar', '48000',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-y',
        tempOutput
      ])

      let stderr = ''
      ffmpeg.stderr.on('data', d => stderr += d.toString())
      ffmpeg.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error(stderr))
      })
    })

    const opusBuffer = fs.readFileSync(tempOutput)

    const newsletterInfo = {
      newsletterJid: idsal,
      serverMessageId: 100
    }

    await conn.sendMessage(idsal, {
      audio: opusBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: newsletterInfo,
        externalAdReplyOffOffOff: {
          title: v.title,
          body: v.author.name,
          thumbnailUrl: v.thumbnail,
          sourceUrl: v.url,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: null })

    await m.reply(`Berhasil kirim ke channel\n\n${v.title}`)

  } catch (e) {
    console.error(e)
    m.reply('Gagal mengambil audio')
  } finally {
    if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput)
    if (tempOutput && fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)
  }
}

handler.help = ['playch']
handler.tags = ['owner']
handler.command = /^playch$/i
handler.owner = true

export default handler