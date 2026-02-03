import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import { xpRange } from '../lib/levelling.js'

let handler = async (m, { conn }) => {

  let who = m.isGroup
    ? (m.mentionedJid?.[0] || m.quoted?.sender || m.sender)
    : m.sender

  let user = global.db.data.users[who]
  if (!user) return m.reply('User tidak ada di database.')

  let pp = './src/avatar_contact.png'
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {}

  const botNumber = conn.decodeJid(conn.user.id)
  const ownerList = global.owner.map(([number]) =>
    number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  )

  const isOwner = m.fromMe || ownerList.includes(who) || who === botNumber
  const isPrems = isOwner || (user.premiumTime && user.premiumTime > Date.now())
  // =====================================

  let {
    role = 'Newbie',
    level = 0,
    exp = 0,
    limit = 0,
    money = 0,
    registered = false,
    name = '',
    age = '-'
  } = user

  let { min, xp } = xpRange(level, global.multiplier || 1)

  let username = registered ? name : await conn.getName(who)
  let number = PhoneNumber('+' + who.split('@')[0]).getNumber('international')

  let bio = 'Tidak ada bio'
  try {
    bio = (await conn.fetchStatus(who))?.status || 'Tidak ada bio'
  } catch {}

  let timeNow = moment().tz('Asia/Jakarta')
  let date = timeNow.format('DD MMMM YYYY')
  let time = timeNow.format('HH:mm:ss')

  let limitText = isPrems ? 'Unlimited' : limit

  let text = `
🕒 ${time}

🎸 *RPG PROFILE*
──────────────
👤 Nama   : ${username}
🎂 Umur   : ${registered ? age : '-'}
💬 Bio    : ${bio}

🏷️ Tag    : @${who.split('@')[0]}
📱 Nomor  : ${number}

⭐ Level  : ${level}
✨ Exp    : ${exp - min} / ${xp}
🎴 Role   : ${role}
🍡 Limit  : ${limitText}
💰 Money  : ${money}
💗 Status : ${
  isOwner ? 'Owner' :
  isPrems ? 'Premium' :
  'Free User'
}

📅 ${date}
`.trim()

  await conn.sendFile(
    m.chat,
    pp,
    'merpg.jpg',
    text,
    m,
    false,
    { contextInfo: { mentionedJid: [who] } }
  )
}

handler.help = ['merpg']
handler.tags = ['rpg','info']
handler.command = /^(merpg)$/i
handler.group = true
handler.rpg = true

export default handler