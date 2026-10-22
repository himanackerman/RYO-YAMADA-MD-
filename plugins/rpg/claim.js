const COOLDOWN = 86400000

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return m.reply('User tidak ada di database.')

  let now = Date.now()
  let last = user.lastclaim || 0
  let remaining = COOLDOWN - (now - last)

  if (remaining > 0) {
    return m.reply(`Kamu sudah claim hari ini.\nTunggu ${clockString(remaining)} lagi.`)
  }

  if (!user.money) user.money = 0
  if (!user.exp) user.exp = 0
  if (!user.limit) user.limit = 0
  if (!user.potion) user.potion = 0

  let money = 5000 + Math.floor(Math.random() * 5000)
  let exp = 200 + Math.floor(Math.random() * 300)
  let limit = 5
  let potion = Math.floor(Math.random() * 3)

  user.money += money
  user.exp += exp
  user.limit += limit
  user.potion += potion
  user.lastclaim = now

  let text = `
🎁 *DAILY CLAIM BERHASIL*

💵 Money : ${money}
✨ Exp   : ${exp}
🎫 Limit : ${limit}
🥤 Potion: ${potion}

Datang lagi besok ya.
`.trim()

  conn.reply(m.chat, text, m)
}

handler.help = ['claim']
handler.tags = ['rpg']
handler.command = /^(claim)$/i
handler.rpg = true
handler.register = true

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}