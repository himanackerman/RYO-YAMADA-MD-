let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) throw '❌ Hanya owner utama yang bisa pakai perintah ini!'
  if (!args[0]) throw 'Contoh: .addowner 628xxxxx'

  let number = args[0].replace(/[^0-9]/g, '')
  let jid = number + '@s.whatsapp.net'

  if (global.owner.find(([id]) => id === number)) {
    throw '✅ Nomor sudah jadi owner!'
  }

  global.owner.push([number, ''])
  conn.reply(m.chat, `✅ @${number} sekarang adalah owner sementara`, m, {
    mentions: [jid]
  })
}

handler.help = ['addowner <nomor>']
handler.tags = ['owner']
handler.command = /^addowner$/i
handler.owner = true

export default handler