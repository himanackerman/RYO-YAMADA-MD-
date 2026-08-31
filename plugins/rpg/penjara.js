let handler = async (m, { conn, command, args, isAdmin, isOwner }) => {

  let users = global.db.data.users
  let who = m.mentionedJid?.[0] || m.quoted?.sender

  if (command === 'penjara') {
    if (!isAdmin && !isOwner) return m.reply('Khusus admin atau owner.')
    if (!who) return m.reply('Tag orang yang mau dipenjara.')

    let target = users[who]
    if (!target) return m.reply('User tidak ada di database.')

    let time = 10 * 60 * 1000
    target.jailUntil = Date.now() + time

    return conn.reply(m.chat, `
⛓️ *PENJARA RPG*

@${who.split('@')[0]} telah dipenjara!
Durasi: 10 menit

Gunakan:
.statuspenjara
.kabur
`, m, { mentions: [who] })
  }

  let user = users[m.sender]
  user.jailUntil = user.jailUntil || 0

  if (command === 'statuspenjara') {
    if (Date.now() < user.jailUntil) {
      let sisa = user.jailUntil - Date.now()
      return m.reply(`⛓️ Kamu masih dipenjara.\nSisa waktu: ${clockString(sisa)}`)
    } else {
      return m.reply('✅ Kamu tidak sedang di penjara.')
    }
  }

  if (command === 'kabur') {
    if (Date.now() >= user.jailUntil)
      return m.reply('Kamu tidak sedang dipenjara.')

    let chance = Math.random()

    if (chance < 0.35) {
      user.jailUntil = 0
      return m.reply('🏃‍♂️💨 Kamu berhasil kabur dari penjara!')
    } else {
      user.jailUntil += 5 * 60 * 1000
      return m.reply('❌ Gagal kabur!\nHukuman ditambah 5 menit.')
    }
  }
}

handler.help = ['penjara @tag', 'kabur', 'statuspenjara']
handler.tags = ['rpg']
handler.command = /^(penjara|kabur|statuspenjara)$/i
handler.group = true
handler.rpg = true

export default handler

function clockString(ms) {
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${m} menit ${s} detik`
}