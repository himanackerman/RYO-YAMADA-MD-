let handler = async (m, { conn, text }) => {
  if (!text) throw 'Format:\n.addlimit @user 1000\n.addlimit 628xxxx 1000'

  let users = global.db.data.users
  let args = text.trim().split(/\s+/)
  let jumlah = parseInt(args[1]) || 1000
  let who

  if (m.quoted) {
    who = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid.length) {
    who = m.mentionedJid[0]
  } else if (args[0].match(/^\d{5,}$/)) {
    who = args[0].replace(/\D/g, '') + '@s.whatsapp.net'
  }

  if (!who) throw 'Tag, reply, atau masukkan nomor user!'

  if (!users[who]) users[who] = { limit: 0 }
  users[who].limit += jumlah

  conn.reply(
    m.chat,
    `✅ *DONE*\n\n👤 User: @${who.split('@')[0]}\n➕ Limit: +${jumlah}`,
    m,
    { mentions: [who] }
  )
}

handler.help = ['addlimit @user <jumlah>', 'addlimit nomor <jumlah>']
handler.tags = ['owner']
handler.command = /^addlimit(user)?$/i
handler.rowner = true

export default handler