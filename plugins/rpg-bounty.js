let handler = async (m, { conn, args }) => {

  let user = global.db.data.users[m.sender]
  if (!user) return m.reply('User tidak ada di database.')

  user.bounty = user.bounty || null
  user.lastBounty = user.lastBounty || 0
  user.healt = user.healt || 100

  const now = Date.now()
  const COOLDOWN = 2 * 60 * 60 * 1000

  const targets = [
    { name: 'Bandit Hutan', hp: 120 },
    { name: 'Pencuri Kota', hp: 150 },
    { name: 'Assassin Bayangan', hp: 180 },
    { name: 'Pemburu Liar', hp: 140 },
    { name: 'Penjahat Elite', hp: 220 }
  ]

  if (!args[0]) {
    if (!user.bounty) {
      return m.reply(`
🎯 *BOUNTY HUNT*

Kamu belum punya target buruan.

Gunakan:
.bounty ambil
`.trim())
    }

    return m.reply(`
🎯 *TARGET BOUNTY*

👹 Target : ${user.bounty.name}
❤️ HP     : ${user.bounty.hp}

Gunakan:
.bounty serang
`.trim())
  }

  if (args[0] === 'ambil') {

    if (now - user.lastBounty < COOLDOWN) {
      let sisa = clockString(COOLDOWN - (now - user.lastBounty))
      return m.reply(`⏳ Tunggu ${sisa} untuk ambil bounty lagi.`)
    }

    let t = targets[Math.floor(Math.random() * targets.length)]
    user.bounty = { ...t }
    user.lastBounty = now

    return m.reply(`
🎯 *BOUNTY BARU DIDAPAT!*

Target : ${t.name}
HP     : ${t.hp}

Gunakan:
.bounty serang
`.trim())
  }

  if (args[0] === 'serang') {

    if (!user.bounty) return m.reply('❌ Kamu belum punya target bounty.')

    if (user.healt < 20) {
      let heal = rand(20, 40)
      user.healt += heal
      return m.reply(`💊 Kurumi nolongin kamu~\n❤️ Health +${heal}\nSekarang: ${user.healt}\n\nCoba serang lagi yaa~`)
    }

    let dmg = rand(20, 50)
    let counter = rand(5, 15)

    user.bounty.hp -= dmg
    user.healt -= counter

    if (user.bounty.hp <= 0) {

      let exp = rand(300, 700)
      let money = rand(5000, 15000)

      user.exp = (user.exp || 0) + exp
      user.money = (user.money || 0) + money
      user.bounty = null

      return m.reply(`
🏆 *BOUNTY SELESAI!*

Target berhasil dikalahkan!

✨ +${exp} EXP
💰 +${money} Money
❤️ Health tersisa: ${user.healt}
`.trim())
    }

    return m.reply(`
⚔️ *SERANGAN!*

Kamu memberi damage: -${dmg}
Musuh membalas: -${counter}

Sisa HP Target: ${user.bounty.hp}
❤️ Health kamu: ${user.healt}

Lanjutkan:
.bounty serang
`.trim())
  }

  return m.reply('Gunakan:\n.bounty\n.bounty ambil\n.bounty serang')
}

handler.help = ['bounty', 'bounty ambil', 'bounty serang']
handler.tags = ['rpg']
handler.command = /^(bounty)$/i
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