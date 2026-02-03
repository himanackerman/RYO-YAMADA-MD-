let handler = async (m, { conn, args }) => {

  if (!global.worldEvent) global.worldEvent = {}
  if (!global.worldEventCD) global.worldEventCD = {}
  if (typeof global.lastBossIndex !== 'number') global.lastBossIndex = -1

  let now = Date.now()
  let cd = global.worldEventCD[m.chat] || 0
  let EVENT_CD = 6 * 60 * 60 * 1000

  if (!global.worldEvent[m.chat] && now - cd < EVENT_CD) {
    let sisa = clockString(EVENT_CD - (now - cd))
    return m.reply(`⏳ Event masih cooldown.\nCoba lagi dalam *${sisa}*`)
  }

  const bossList = [
    { name: '🧟 Zombie King', hp: 40000, min: 800, max: 2000, tier: 'Easy' },
    { name: '🐉 Ancient Dragon', hp: 80000, min: 1500, max: 3500, tier: 'Medium' },
    { name: '😈 Demon Lord', hp: 120000, min: 2500, max: 5000, tier: 'Hard' },
  ]

  let chat = global.worldEvent[m.chat]

  if (!chat) {
    global.lastBossIndex++
    if (global.lastBossIndex >= bossList.length) global.lastBossIndex = 0
    let boss = bossList[global.lastBossIndex]

    global.worldEvent[m.chat] = {
      ...boss,
      maxHp: boss.hp,
      attackers: {},
      start: now
    }

    return m.reply(`
🌍🔥 *WORLD EVENT DIMULAI!*

Boss : ${boss.name}
Tier : ${boss.tier}
❤️ HP : ${boss.hp}

Perintah:
.event join
.event status
`.trim())
  }

  if (args[0] === 'status') {
    return m.reply(`
🌍 *WORLD EVENT STATUS*

Boss : ${chat.name}
Tier : ${chat.tier}
❤️ HP : ${chat.hp} / ${chat.maxHp}

👥 Penyerang: ${Object.keys(chat.attackers).length}
`.trim())
  }

  if (args[0] === 'join') {
    let user = global.db.data.users[m.sender]

    user.healt = user.healt || 100
    user.money = user.money || 0
    user.exp = user.exp || 0

    if (user.healt < 30) {
      return m.reply('❤️ Health kamu terlalu rendah untuk ikut event!')
    }

    let damage = rand(chat.min, chat.max)
    chat.hp -= damage
    chat.attackers[m.sender] = (chat.attackers[m.sender] || 0) + damage

    let counter = rand(5, 20)
    user.healt -= counter

    if (chat.hp <= 0) {
      return finishEvent(m, conn, chat)
    }

    return conn.sendMessage(m.chat, {
      text: `
⚔️ *SERANGAN BERHASIL!*

@${m.sender.split('@')[0]} memberi damage: *-${damage}*
Boss membalas: ❤️ -${counter}

Sisa HP Boss:
❤️ ${chat.hp} / ${chat.maxHp}
`.trim(),
      mentions: [m.sender]
    }, { quoted: m })
  }

  return m.reply(`
🌍 *WORLD EVENT*

Boss : ${chat.name}
❤️ HP : ${chat.hp} / ${chat.maxHp}

.event join
.event status
`.trim())
}

async function finishEvent(m, conn, chat) {
  let users = global.db.data.users
  let teks = `🎉 *WORLD EVENT SELESAI!*\n\nBoss ${chat.name} berhasil dikalahkan!\n\n🏆 *RANKING DAMAGE:*\n`

  let sorted = Object.entries(chat.attackers).sort((a, b) => b[1] - a[1])

  for (let i = 0; i < sorted.length; i++) {
    let jid = sorted[i][0]
    let dmg = sorted[i][1]
    let user = users[jid]

    let rewardMoney = Math.floor(dmg / 4)
    let rewardExp = Math.floor(dmg / 8)

    let bonus = ''
    if (rand(1, 100) > 90) {
      user.limit = (user.limit || 0) + 1
      bonus = '🎟️ +1 Limit'
    }

    user.money = (user.money || 0) + rewardMoney
    user.exp = (user.exp || 0) + rewardExp

    teks += `${i + 1}. @${jid.split('@')[0]} — ${dmg} dmg\n`
    teks += `   💰 +${rewardMoney} | ✨ +${rewardExp} ${bonus ? '| ' + bonus : ''}\n`
  }

  await conn.sendMessage(m.chat, {
    text: teks.trim(),
    mentions: sorted.map(v => v[0])
  }, { quoted: m })

  global.worldEventCD[m.chat] = Date.now()
  delete global.worldEvent[m.chat]
}

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

handler.help = ['event', 'event join', 'event status']
handler.tags = ['rpg']
handler.command = /^(event)$/i
handler.group = true
handler.rpg = true

export default handler