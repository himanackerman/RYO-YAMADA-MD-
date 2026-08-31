let handler = async (m, { conn, args }) => {

  let user = global.db.data.users[m.sender]

  user.dailyQuest = user.dailyQuest || {}
  user.lastDailyQuest = user.lastDailyQuest || 0

  let now = Date.now()
  let oneDay = 24 * 60 * 60 * 1000

  if (now - user.lastDailyQuest > oneDay) {
    user.dailyQuest = {
      work: 0,
      hunt: 0,
      mancing: 0,
      done: false
    }
    user.lastDailyQuest = now
  }

  let q = user.dailyQuest

  if (!args[0]) {
    return m.reply(`
📜 *DAILY QUEST — HARI INI*

1. 🔧 Kerja 2x
   Progress: ${q.work}/2

2. 🏹 Hunt 2x
   Progress: ${q.hunt}/2

3. 🎣 Mancing 1x
   Progress: ${q.mancing}/1

Reward:
✨ EXP
💰 Money
🎟️ Chance Limit

Ketik:
.quest claim
`.trim())
  }

  if (args[0] === 'claim') {
    if (q.done) return m.reply('❌ Quest hari ini sudah kamu klaim.')

    if (q.work < 2 || q.hunt < 2 || q.mancing < 1) {
      return m.reply('❌ Quest belum selesai semua.')
    }

    q.done = true

    let exp = Math.floor(Math.random() * 500) + 300
    let money = Math.floor(Math.random() * 10000) + 5000

    user.exp = (user.exp || 0) + exp
    user.money = (user.money || 0) + money

    let bonus = ''
    if (Math.random() > 0.8) {
      user.limit = (user.limit || 0) + 1
      bonus = '\n🎟️ Bonus: +1 Limit'
    }

    return m.reply(`
🎉 *QUEST HARIAN SELESAI!*

✨ +${exp} EXP
💰 +${money} Money${bonus}

Besok datang lagi ya~
`.trim())
  }

  return m.reply('Gunakan:\n.quest\n.quest claim')
}

handler.help = ['quest', 'quest claim']
handler.tags = ['rpg']
handler.command = /^(quest)$/i
handler.group = true
handler.rpg = true

export default handler