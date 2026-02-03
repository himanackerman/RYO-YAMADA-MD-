let handler = async (m, { conn, args }) => {

  let user = global.db.data.users[m.sender]
  if (!user) return m.reply('User tidak ada di database.')

  user.tower = user.tower || { floor: 1, hp: 0 }
  user.healt = user.healt || 100
  user.exp = user.exp || 0
  user.money = user.money || 0

  let floor = user.tower.floor

  let enemyHp = 80 + (floor * 30)
  let enemyAtkMin = 5 + floor * 2
  let enemyAtkMax = 10 + floor * 3

  if (!args[0]) {
    return m.reply(`
🏰 *TOWER CHALLENGE*

Kamu sekarang di:
🧱 Lantai : ${floor}
❤️ Health: ${user.healt}

Gunakan:
.tower fight
.tower reset
`.trim())
  }

  if (args[0] === 'reset') {
    user.tower.floor = 1
    return m.reply('🔁 Tower di-reset. Kamu kembali ke lantai 1.')
  }

  if (args[0] === 'fight') {

    if (user.healt < 20) {
      let heal = rand(20, 40)
      user.healt += heal
      return m.reply(`💊 Kurumi nolongin kamu~\n❤️ Health +${heal}\nSekarang: ${user.healt}`)
    }

    let playerAtk = rand(20, 40) + Math.floor(floor * 1.5)
    let enemyAtk = rand(enemyAtkMin, enemyAtkMax)

    enemyHp -= playerAtk
    user.healt -= enemyAtk

    if (enemyHp <= 0) {

      let exp = 200 + floor * 100
      let money = 3000 + floor * 1500

      user.exp += exp
      user.money += money
      user.tower.floor += 1

      return m.reply(`
🏆 *MENANG!*

Kamu berhasil naik ke:
🧱 Lantai ${user.tower.floor}

✨ +${exp} EXP
💰 +${money} Money
❤️ Health tersisa: ${user.healt}

Lanjut:
.tower fight
`.trim())
    }

    if (user.healt <= 0) {
      user.healt = 20
      user.tower.floor = Math.max(1, floor - 2)

      return m.reply(`
💀 *KALAH!*

Kamu terlempar turun...

Sekarang di:
🧱 Lantai ${user.tower.floor}
❤️ Health diset: 20

Latih diri lalu coba lagi!
`.trim())
    }

    return m.reply(`
⚔️ *PERTARUNGAN!*

Kamu menyerang: -${playerAtk}
Musuh menyerang: -${enemyAtk}

❤️ Health kamu: ${user.healt}
🧟 HP Musuh: ${enemyHp}

Lanjut:
.tower fight
`.trim())
  }

  return m.reply('Gunakan:\n.tower\n.tower fight\n.tower reset')
}

handler.help = ['tower', 'tower fight', 'tower reset']
handler.tags = ['rpg']
handler.command = /^(tower)$/i
handler.group = true
handler.rpg = true

export default handler

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}