import PhoneNumber from 'awesome-phonenumber'
import { xpRange } from '../lib/levelling.js'

let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.fromMe
    ? conn.user.jid
    : m.sender

  let user = global.db.data.users[who]
  if (!user) return m.reply('User tidak ada di database')

  let pp = './src/avatar_contact.png'
  try {
    pp = await conn.profilePictureUrl(who)
  } catch {}

  let level = user.level || 0
  let exp = user.exp || 0
  let limit = user.limit || 0
  let role = user.role || 'Beginner'

  // multiplier aman
  let { min, xp, max } = xpRange(level, global.multiplier || 1)

  let username = conn.getName(who)
  let premium = user.premiumTime > 0 ? 'Yes' : 'No'

  let str = `
*PROFILE*
• *Name:* ${username} ${user.registered ? '(' + user.name + ')' : ''} (@${who.split('@')[0]})
• *Number:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
• *Link:* https://wa.me/${who.split('@')[0]}
• *Age:* ${user.registered ? user.age : '-'}
• *Exp:* ${exp} (${exp - min} / ${xp})
• *Role:* ${role}
• *Limit:* ${limit}
• *Registered:* ${user.registered ? 'Yes' : 'No'}
• *Premium:* ${premium}
`.trim()

  conn.sendFile(m.chat, pp, 'pp.jpg', str, m, false, {
    contextInfo: { mentionedJid: [who] }
  })
}

handler.help = ['profile [@user]']
handler.tags = ['xp']
handler.command = /^profile$/i
handler.register = true
handler.rpg = true

export default handler