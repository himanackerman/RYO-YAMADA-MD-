import { xpRange } from '../lib/levelling.js'

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let { min, max } = xpRange(user.level)
  let next = max - user.exp

  m.reply(`
📊 Level Info
🆙 Level: *${user.level}*
✨ XP: *${user.exp} / ${max}*
➡️ Menuju level ${user.level + 1}: *${next} XP lagi*
`.trim())
}

handler.help = ['ceklvl']
handler.tags = ['rpg']
handler.command = /^ceklvl$/i

export default handler