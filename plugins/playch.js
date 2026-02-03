import axios from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'

let handler = async (m, { conn, text, command, usedPrefix, isOwner }) => {
  try {
    if (!isOwner) return m.reply('Fitur ini hanya untuk owner bot!')
    if (!text) return m.reply(`Contoh:\n${usedPrefix}${command} judul lagu`)

    let idchannel = global.chId
    if (!idchannel) return m.reply('ID channel belum diatur di config.js!')

    let botname = global.botname || 'RYO YAMADA - MD'

    await m.reply('✨ wait')

    const newsletterInfo = {
      newsletterJid: idchannel,
      serverMessageId: 100,
      newsletterName: botname
    }

    const api = `https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(text)}`
    const { data } = await axios.get(api)

    if (!data || !data.status || !data.result) return m.reply('Lagu tidak ditemukan.')

    const info = data.result
    const title = info.title
    const thumbnail = info.thumbnail
    const downloadUrl = info.dlink
    const youtubeUrl = info.url

    if (!downloadUrl || !youtubeUrl) return m.reply('Data dari API tidak lengkap.')

    const audioReq = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const tempInput = path.join(os.tmpdir(), `${Date.now()}_input.mp3`)
    const tempOutput = path.join(os.tmpdir(), `${Date.now()}_output.opus`)

    fs.writeFileSync(tempInput, Buffer.from(audioReq.data))

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -y -i "${tempInput}" -map_metadata -1 -vn -ac 1 -ar 48000 -c:a libopus -b:a 64k "${tempOutput}"`,
        err => err ? reject(err) : resolve()
      )
    })

    let thumbnailBuffer = null
    try {
      if (thumbnail) {
        const thumbReq = await axios.get(thumbnail, {
          responseType: 'arraybuffer',
          timeout: 10000
        })
        thumbnailBuffer = Buffer.from(thumbReq.data)
      }
    } catch {}

    const audioData = fs.readFileSync(tempOutput)

    const messageData = {
      audio: audioData,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }

    if (thumbnailBuffer) {
      messageData.contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: newsletterInfo,
        externalAdReply: {
          title: title.substring(0, 60),
          body: 'RYO YAMADA - MD',
          thumbnail: thumbnailBuffer,
          mediaType: 1,
          renderLargerThumbnail: false,
          sourceUrl: youtubeUrl,
          mediaUrl: youtubeUrl,
          showAdAttribution: false
        }
      }
    }

    await conn.sendMessage(idchannel, messageData)

    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput)
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)

    await m.reply(`Berhasil mengirim VN ke channel:\n${title}`)
  } catch (e) {
    console.error(e)
    m.reply('Terjadi kesalahan saat memproses permintaan.')
  }
}

handler.help = ['playch <judul lagu>']
handler.tags = ['owner']
handler.command = /^(playch|playchannel)$/i
handler.owner = true

export default handler