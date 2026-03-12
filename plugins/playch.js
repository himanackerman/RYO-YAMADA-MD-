// Fitur Play CH 
// Note : Setting ID Channel nya di config.js

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

let isSending = false

let handler = async (m, { conn, text, command, usedPrefix, isOwner }) => {
  if (!isOwner) return m.reply('Fitur ini hanya untuk owner bot!')
  if (!text) return m.reply(`Contoh:\n${usedPrefix}${command} judul lagu`)
  if (isSending) return m.reply('✨ Tunggu dulu, sedang mengirim ke channel...')

  const idchannel = global.chId
  if (!idchannel) return m.reply('ID channel belum diatur di config.js!')

  const botname = global.botname || 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ'

  isSending = true
  let tempInput, tempOutput

  try {
    await m.reply('✨ wait')

    const api = `https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(text)}`
    const { data } = await axios.get(api)

    if (!data?.status || !data?.result) {
      throw 'Lagu tidak ditemukan.'
    }

    const { title, thumbnail, dlink } = data.result
    if (!dlink) throw 'Data dari API tidak lengkap.'

    const audioReq = await axios.get(dlink, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    tempInput = path.join(os.tmpdir(), `${Date.now()}_input.mp3`)
    tempOutput = path.join(os.tmpdir(), `${Date.now()}_output.opus`)

    fs.writeFileSync(tempInput, Buffer.from(audioReq.data))

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', tempInput,
        '-map_metadata', '-1',
        '-vn',
        '-ac', '1',
        '-ar', '48000',
        '-c:a', 'libopus',
        '-b:a', '96k',
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
      newsletterJid: idchannel,
      serverMessageId: 100,
      newsletterName: botname
    }

    await conn.sendMessage(idchannel, {
      audio: opusBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: newsletterInfo,
        externalAdReply: {
          title: title.substring(0, 60),
          body: botname,
          thumbnailUrl: thumbnail,
          sourceUrl: 'https://github.com/himanackerman',
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: null })

    await conn.sendMessage(m.chat, {
      text: `✨ Berhasil terkirim ke channel\n\n🎸 ${title}`
    }, { quoted: global.fvn })

  } catch (e) {
    console.error('PlayCH Error:', e)
    await conn.sendMessage(m.chat, {
      text: '✨ Terjadi kesalahan saat memproses permintaan.'
    }, { quoted: global.fvn })
  } finally {
    if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput)
    if (tempOutput && fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)
    isSending = false
  }
}

handler.help = ['playch <judul lagu>']
handler.tags = ['owner']
handler.command = /^(playch|playchannel)$/i
handler.owner = true

export default handler
