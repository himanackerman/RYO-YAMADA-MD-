let handler = async (m, { conn, usedPrefix }) => {
  try {
    const wm = 'Ryo Yamada MD'

    let user = global.db.data.users[m.sender]

    // ===== INIT DATA =====
    user.lastadventure = user.lastadventure || 0
    user.healt = user.healt || 100
    user.exp = user.exp || 0
    user.money = user.money || 0
    user.armor = user.armor || 0
    user.kucing = user.kucing || 0
    user.anjing = user.anjing || 0
    user.kuda = user.kuda || 0

    let cooldown = 300000
    let now = new Date() * 1
    let timers = clockString(cooldown - (now - user.lastadventure))

    if (user.healt < 80) {
      return m.reply(`
❤️ Health kamu terlalu rendah untuk berpetualang!

Gunakan:
${usedPrefix}use potion

Atau beli potion:
${usedPrefix}shop buy potion 1
`.trim())
    }

    if (now - user.lastadventure < cooldown) {
      return m.reply(`⏳ Tunggu *${timers}* sebelum bisa adventure lagi.`)
    }

    let healt = calculateHealth(user.kucing, user.armor)
    let exp = Math.floor(Math.random() * 400) + (user.kuda * 70)
    let uang = Math.floor(Math.random() * 400) + (user.anjing * 70)

    user.healt -= healt
    user.exp += exp
    user.money += uang
    user.lastadventure = now

    let message = `
🏕️ *ADVENTURE SELESAI!*

❤️ Health -${healt}
✨ EXP +${exp}
💰 Money +${uang}

Jangan lupa istirahat dulu ya~
`.trim()

    await conn.sendMessage(m.chat, { text: message }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Error\n\n' + e)
  }
}

function calculateHealth(kucing, armor) {
  let base = Math.floor(Math.random() * 30) + 10
  let bonus = (kucing * 5) + (armor * 5)
  let result = base - bonus
  if (result < 1) result = 1
  return result
}

function clockString(ms) {
  if (ms < 0) ms = 0
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${h} Jam ${m} Menit ${s} Detik`
}

handler.help = ['work']
handler.tags = ['rpg']
handler.command = /^(work)$/i
handler.group = true
handler.register = true
handler.rpg = true

export default handler