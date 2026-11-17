import { initUser } from '../../lib/core/database.js'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  let who

  if (m.quoted) {
    who = m.quotedSenderPN || m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJidPN?.[0] || m.mentionedJid[0]
  } else if (args[0]) {
    let number = args[0].replace(/[^0-9]/g, '')
    if (!number) throw `Contoh penggunaan:\n${usedPrefix + command} @user\n${usedPrefix + command} 628xxx\nAtau reply pesan target dengan: *${usedPrefix + command}*`
    who = number + '@s.whatsapp.net'
  } else {
    throw `Contoh penggunaan:\n${usedPrefix + command} @user\n${usedPrefix + command} 628xxx\nAtau reply pesan target dengan perintah: *${usedPrefix + command}*`
  }

  if (!who) throw 'Target user tidak ditemukan!'

  if (!who.includes('@')) who = who + '@s.whatsapp.net'

  let targetNumber = who.split('@')[0].replace(/[^0-9]/g, '')

  global.db.data.users = global.db.data.users || {}
  let user = global.db.data.users[who]

  if (!user || !user.banned) {
    return conn.reply(m.chat, `⚠️ User @${targetNumber} tidak sedang dalam status banned.`, m, {
      mentions: [who]
    })
  }

  user.banned = false
  user.banReason = ''

  let caption = `*\`UNBAN USER\`*

✿ Status  : Aktif Kembali ✅
✿ User    : @${targetNumber}

User ini sekarang sudah dapat menggunakan bot kembali.`

  await conn.reply(m.chat, caption, m, {
    mentions: [who]
  })
}

handler.help = ['unbanuser <@user/nomor/reply>', 'unban <@user/nomor/reply>']
handler.tags = ['owner']
handler.command = /^(unban|unbanuser)$/i
handler.owner = true

export default handler
