import { initUser } from '../../lib/core/database.js'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  let who
  let reason = ''

  if (m.quoted) {
    who = m.quotedSenderPN || m.quoted.sender
    reason = text ? text.trim() : 'Tidak ada alasan'
  } else if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJidPN?.[0] || m.mentionedJid[0]
    reason = text ? text.replace(/@[0-9]+/g, '').trim() : ''
    reason = reason || 'Tidak ada alasan'
  } else if (args[0]) {
    let number = args[0].replace(/[^0-9]/g, '')
    if (!number) throw `Contoh penggunaan:\n${usedPrefix + command} @user [alasan]\n${usedPrefix + command} 628xxx [alasan]\nAtau reply pesan target dengan: *${usedPrefix + command} [alasan]*`
    who = number + '@s.whatsapp.net'
    reason = args.slice(1).join(' ').trim() || 'Tidak ada alasan'
  } else {
    throw `Contoh penggunaan:\n${usedPrefix + command} @user [alasan]\n${usedPrefix + command} 628xxx [alasan]\nAtau reply pesan target dengan perintah: *${usedPrefix + command} [alasan]*`
  }

  if (!who) throw 'Target user tidak ditemukan!'

  if (!who.includes('@')) who = who + '@s.whatsapp.net'

  let botNumber = (conn.user?.id || conn.user?.jid || '').split(':')[0].replace(/[^0-9]/g, '')
  let targetNumber = who.split('@')[0].replace(/[^0-9]/g, '')

  if (targetNumber === botNumber) {
    return conn.reply(m.chat, '❌ Tidak dapat membanned bot ini sendiri!', m)
  }

  let isTargetOwner = (global.owner || []).some(([ownerNum]) => ownerNum.replace(/[^0-9]/g, '') === targetNumber)
  if (isTargetOwner) {
    return conn.reply(m.chat, '❌ Tidak dapat membanned Owner bot!', m)
  }

  global.db.data.users = global.db.data.users || {}
  let user = global.db.data.users[who]
  if (!user) {
    user = initUser(who)
  }

  if (user.banned) {
    return conn.reply(m.chat, `⚠️ User @${targetNumber} sudah dalam status terbanned sebelumnya.\n\nAlasan: ${user.banReason || 'Tidak ada alasan'}`, m, {
      mentions: [who]
    })
  }

  user.banned = true
  user.banReason = reason

  let caption = `*\`BAN USER\`*

✿ Status  : Terbanned ❌
✿ User    : @${targetNumber}
✿ Alasan  : ${reason}

User ini tidak dapat menggunakan bot lagi sampai di-unban oleh Owner.`

  await conn.reply(m.chat, caption, m, {
    mentions: [who]
  })
}

handler.help = ['banuser <@user/nomor/reply> [alasan]', 'ban <@user/nomor/reply> [alasan]']
handler.tags = ['owner']
handler.command = /^(ban|banuser)$/i
handler.owner = true

export default handler
