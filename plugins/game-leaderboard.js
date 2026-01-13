let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`📊 Pilih leaderboard yang mau diliat:\n\n${usedPrefix + command} level\n${usedPrefix + command} limit\n${usedPrefix + command} exp`)

  let users = Object.entries(global.db.data.users).map(([jid, data]) => {
    return {
      jid,
      name: data.name || jid.split('@')[0],
      level: data.level || 0,
      limit: data.limit || 0,
      exp: data.exp || 0
    }
  })

  if (!users.length) return m.reply('❌ Belum ada data user.')

  let list = []
  let title = ''

  switch (text.toLowerCase()) {
    case 'level':
      users.sort((a, b) => b.level - a.level)
      list = users.map((u, i) => `${i + 1}. *${u.name}* — Level: *${u.level}*`)
      title = '🏆 *LEADERBOARD LEVEL*'
      break
    case 'limit':
      users.sort((a, b) => b.limit - a.limit)
      list = users.map((u, i) => `${i + 1}. *${u.name}* — Limit: *${u.limit}*`)
      title = '🏆 *LEADERBOARD LIMIT*'
      break
    case 'exp':
      users.sort((a, b) => b.exp - a.exp)
      list = users.map((u, i) => `${i + 1}. *${u.name}* — XP: *${u.exp}*`)
      title = '🏆 *LEADERBOARD XP*'
      break
    default:
      return m.reply(`❌ Pilih salah satu:\n• *level*\n• *limit*\n• *exp*`)
  }

  let you = users.findIndex(u => u.jid === m.sender)
  let yourRank = you !== -1 ? `\n\n📊 Posisi kamu: *#${you + 1}*` : ''

  let textRes = `${title}\n\n${list.slice(0, 10).join('\n')}${yourRank}`
  m.reply(textRes)
}

handler.help = ['leaderboard <level|limit|exp>']
handler.tags = ['game']
handler.command = /^leaderboard$/i

export default handler