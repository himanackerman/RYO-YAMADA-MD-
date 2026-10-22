import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const quoted = m.quoted || m
    const mime = quoted?.mimetype || ''

    if (!mime.startsWith('audio/')) return m.reply(`Kirim/reply audio dulu!\nContoh: reply audio lalu ketik *${usedPrefix}${command}*`)

    const filePath = './media/tes.mp3'
    const buffer = await quoted.download()

    fs.writeFileSync(filePath, buffer)
    m.reply('✅ Audio menu berhasil diupdate!')

  } catch (e) {
    console.error(e)
    m.reply('Error: ' + e.message)
  }
}

handler.command = /^setaudio$/i
handler.tags = ['owner']
handler.help = ['setaudio']
handler.owner = true

export default handler