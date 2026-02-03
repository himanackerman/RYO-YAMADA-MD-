let handler = async (m, { conn, args }) => {

  let user = global.db.data.users[m.sender]
  if (!user) return m.reply('User tidak ada di database.')

  user.rift = user.rift || { stage: 0, hp: 0 }
  user.healt = user.healt || 100
  user.exp = user.exp || 0
  user.money = user.money || 0

  if (!args[0]) {
    if (user.rift.stage === 0) {
      return m.reply(`
🌀 *RIFT DUNGEON*

Kamu belum masuk rift.

Gunakan:
.rift enter
`.trim())
    }

    return m.reply(`
🌀 *RIFT DUNGEON*

Stage : ${user.rift.stage}
❤️ Health: ${user.healt}

Pilih jalan:
.rift kiri
.rift kanan
.rift tengah
`.trim())
  }

  if (args[0] === 'enter') {
    if (user.rift.stage > 0) return m.reply('Kamu sudah berada di dalam rift.')

    user.rift.stage = 1
    return m.reply(`
🌀 *KAMU MASUK KE RIFT!*

Kabut tebal menyelimuti...
Pilih jalan pertama:

.rift kiri
.rift kanan
.rift tengah
`.trim())
  }

  if (!['kiri', 'kanan', 'tengah'].includes(args[0])) {
    return m.reply('Gunakan:\n.rift enter\n.rift kiri\n.rift kanan\n.rift tengah')
  }

  if (user.rift.stage === 0) {
    return m.reply('Kamu belum masuk rift.\nGunakan: .rift enter')
  }

  let roll = Math.random()

  if (roll < 0.45) {
    let dmg = rand(10, 30)
    user.healt -= dmg

    if (user.healt <= 0) {
      user.healt = 20
      user.rift.stage = 0
      return m.reply(`
💀 *KAMU TERKALAHKAN!*

Jebakan mematikan menjatuhkanmu.
Kamu terlempar keluar rift.

❤️ Health diset: 20
`.trim())
    }

    user.rift.stage += 1
    return m.reply(`
⚠️ *JEBAKAN!*

Kamu terluka: -${dmg}
❤️ Health: ${user.healt}

Lanjut ke stage ${user.rift.stage}
Pilih lagi:

.rift kiri
.rift kanan
.rift tengah
`.trim())
  }

  if (roll < 0.8) {
    let exp = rand(150, 400)
    let money = rand(2000, 6000)

    user.exp += exp
    user.money += money
    user.rift.stage += 1

    return m.reply(`
🎁 *HARTA DITEMUKAN!*

✨ +${exp} EXP
💰 +${money} Money

Sekarang di stage ${user.rift.stage}
Pilih jalan:

.rift kiri
.rift kanan
.rift tengah
`.trim())
  }

  let bossHp = 80 + user.rift.stage * 40
  let bossAtk = rand(15, 30)

  user.healt -= bossAtk

  if (user.healt <= 0) {
    user.healt = 20
    user.rift.stage = 0
    return m.reply(`
👹 *BOSS RIFT!*

Serangan fatal menghancurkanmu...

Kamu keluar dari rift.
❤️ Health diset: 20
`.trim())
  }

  let exp = 400 + user.rift.stage * 150
  let money = 6000 + user.rift.stage * 2500

  user.exp += exp
  user.money += money
  user.rift.stage += 1

  return m.reply(`
👹 *BOSS DIKALAHKAN!*

✨ +${exp} EXP
💰 +${money} Money
❤️ Health: ${user.healt}

Stage sekarang: ${user.rift.stage}
Lanjut?

.rift kiri
.rift kanan
.rift tengah
`.trim())
}

handler.help = ['rift', 'rift enter', 'rift kiri', 'rift kanan', 'rift tengah']
handler.tags = ['rpg']
handler.command = /^(rift)$/i
handler.group = true
handler.rpg = true

export default handler

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}