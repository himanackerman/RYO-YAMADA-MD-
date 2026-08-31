import { startSubBot } from '../../lib/jadibot.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const number = args[0]
  if (!number) {
    return m.reply(`Masukin nomor WhatsApp yang mau dijadiin bot.\n\nContoh: *${usedPrefix + command} 62xxx*`)
  }

  await startSubBot(m, conn, number)
}

handler.help = ['jadibot <nomor>']
handler.tags = ['main']
handler.command = /^jadibot$/i
handler.premium = true

export default handler