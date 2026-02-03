import { xpRange } from '../lib/levelling.js'

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (!user?.rpg) return m.reply('⚠️ Kamu belum memulai RPG. Ketik .mulai untuk memulai.')

  let { min, max } = xpRange(user.rpg.level)
  let next = max - user.rpg.exp

  m.reply(`
📜 *STATUS RPG KAMU*

🆙 *Level:* ${user.rpg.level}
✨ *EXP:* ${user.rpg.exp} / ${max} (${next} XP menuju level ${user.rpg.level + 1})
❤️ *HP:* ${user.rpg.hp}
🔪 *ATK:* ${user.rpg.atk}
💰 *Gold:* ${user.rpg.gold}
🎒 *Inventory:* ${user.rpg.inventory?.length || 0} item

Gunakan skill: *.skill*
Naik level: *.levelup*
`.trim())
}

handler.help = ['status']
handler.tags = ['rpg']
handler.command = /^status$/i

export default handler