import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'

let handler = async (m, { conn, isOwner }) => {
  try {
    if (!isOwner) return m.reply('Khusus owner')

    let idsal = global.chId
    if (!idsal) return m.reply('ID channel belum diset di config.js')

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/audio/.test(mime)) return m.reply('Reply VN / audio yang mau dikirim ke channel')

    await m.reply('wait')

    let media = await q.download()

    const tempInput = path.join(os.tmpdir(), `${Date.now()}_input`)
    const tempOutput = path.join(os.tmpdir(), `${Date.now()}_output.ogg`)

    fs.writeFileSync(tempInput, media)

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -y -i "${tempInput}" -map_metadata -1 -vn -ac 1 -ar 48000 -c:a libopus -b:a 96k "${tempOutput}"`,
        err => err ? reject(err) : resolve()
      )
    })

    const audioData = fs.readFileSync(tempOutput)

    await conn.sendMessage(idsal, {
      audio: audioData,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    })

    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput)
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)

    await m.reply('VN terkirim ke channel')
  } catch (e) {
    console.error(e)
    m.reply('Gagal kirim VN ke channel')
  }
}

handler.help = ['upchvn']
handler.tags = ['owner']
handler.command = /^upchvn$/i
handler.owner = true

export default handler