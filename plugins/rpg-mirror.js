let handler = async (m, { conn }) => {

  let user = global.db.data.users[m.sender]

  user.lastmirror = user.lastmirror || 0
  user.healt = user.healt || 100
  user.exp = user.exp || 0
  user.money = user.money || 0
  user.level = user.level || 1

  let now = Date.now()
  let cooldown = 3 * 60 * 60 * 1000

  if (now - user.lastmirror < cooldown) {
    let sisa = clockString(cooldown - (now - user.lastmirror))
    return m.reply(`⏳ Dimensi Cermin belum stabil.\nCoba lagi dalam *${sisa}*`)
  }

  if (user.healt < 40) {
    return m.reply('❤️ Health kamu terlalu rendah untuk masuk Mirror Dimension.')
  }

  let cloneHp = Math.max(60, user.healt + Math.floor(user.level * 8))

  let playerAtk = rand(20, 40) + Math.floor(user.level * 3)
  let cloneAtk = rand(10, 25) + Math.floor(user.level * 2)

  let log = []
  let turn = 1

  while (user.healt > 0 && cloneHp > 0 && turn <= 12) {
    let dmgToClone = rand(playerAtk - 8, playerAtk + 8)
    let dmgToUser = rand(cloneAtk - 6, cloneAtk + 6)

    cloneHp -= dmgToClone
    user.healt -= dmgToUser

    log.push(`Turn ${turn}\nKamu ➜ -${dmgToClone} | Bayangan ➜ -${dmgToUser}`)
    turn++
  }

  user.lastmirror = now

  if (user.healt <= 0) {
    user.healt = 15
    return m.reply(`
🪞 *MIRROR DIMENSION*

Kamu kalah melawan bayangan sendiri...
Health tersisa: 15

Naikkan level & kumpulkan gear dulu ya~
`.trim())
  }

  let exp = rand(400, 900) + user.level * 60
  let money = rand(8000, 20000) + user.level * 600

  user.exp += exp
  user.money += money

  let bonus = ''
  if (Math.random() > 0.8) {
    user.limit = (user.limit || 0) + 1
    bonus = '\n🎟️ Bonus: +1 Limit'
  }

  return m.reply(`
🪞 *MIRROR DIMENSION CLEARED!*

Kamu berhasil mengalahkan bayangan diri sendiri!

✨ +${exp} EXP
💰 +${money} Money${bonus}

Health tersisa: ${user.healt}

Ringkasan Pertarungan:
${log.join('\n')}
`.trim())
}

handler.help = ['mirror']
handler.tags = ['rpg']
handler.command = /^(mirror)$/i
handler.group = true
handler.rpg = true

export default handler

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clockString(ms) {
  if (isNaN(ms) || ms < 0) ms = 0
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${h} Jam ${m} Menit ${s} Detik`
}