import { stopSubBot } from '../../lib/jadibot.js'

let handler = async (m, { conn, args, isOwner }) => {
  const number = (args[0] || '').replace(/[^0-9]/g, '')
  const senderNumber = m.sender.split('@')[0]

  if (!number) return m.reply('Masukin nomor yang mau di-stop.\n\nContoh: *.delbot 628123456789*')

  if (!isOwner && senderNumber !== number) {
    return global.dfail('owner', m, conn)
  }

  const ok = await stopSubBot(number)
  m.reply(ok
    ? `✅ Sub-bot *${number}* berhasil di-disconnect & sesinya dihapus.`
    : `Nggak nemu sub-bot aktif dengan nomor *${number}*.`)
}

handler.help = ['delbot <nomor>']
handler.tags = ['owner']
handler.command = /^delbot$/i
handler.owner = true

export default handler