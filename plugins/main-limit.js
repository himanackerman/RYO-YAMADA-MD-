let handler = async (m, { conn }) => {
  let who

  if (m.isGroup) {
    who = m.mentionedJid?.[0] || m.sender
  } else {
    who = m.sender
  }

  const user = global.db.data.users[who]
  if (!user) return m.reply('Pengguna tidak ditemukan di database.')

  const botNumber = conn.decodeJid(conn.user.id)

  const ownerList = (global.owner || []).map(v =>
    (Array.isArray(v) ? v[0] : v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  )

  const isOwner = m.fromMe || ownerList.includes(who) || who === botNumber
  const isPrems = isOwner || (user.premiumTime && new Date() - user.premiumTime < 0)

  const name = user.registered ? user.name : await conn.getName(who)

  const limitNow = user.limit || 0
  const limitMax = 1000

  m.reply(`
✦ ──『 🍓 𝑳𝑰𝑴𝑰𝑻 𝑼𝑺𝑬𝑹 🍓 』── ✦

👤 Nama      : ${name}
💢 Status    : ${
  isOwner ? 'Owner' :
  isPrems ? 'Premium User' :
  user.level > 999 ? 'Elite User' :
  'Free User'
}
✨ Limit     : ${isPrems ? 'Unlimited' : `${limitNow} / ${limitMax}`}

`.trim())
}

handler.help = ['limit']
handler.tags = ['xp']
handler.command = /^(limit)$/i
handler.register = false

export default handler