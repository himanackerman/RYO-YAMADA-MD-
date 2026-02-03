export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * .75

export function xpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0) throw new TypeError('level tidak boleh negatif')
  level = Math.floor(level)
  let min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
  let max = Math.round(Math.pow(level + 1, growth) * multiplier)
  return { min, max, xp: max - min }
}

export function findLevel(xp, multiplier = global.multiplier || 1) {
  if (xp === Infinity) return Infinity
  if (isNaN(xp)) return NaN
  if (xp <= 0) return -1
  let level = 0
  do level++
  while (xpRange(level, multiplier).min <= xp)
  return --level
}

export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
  if (level < 0) return false
  if (xp === Infinity) return true
  if (isNaN(xp) || xp <= 0) return false
  return level < findLevel(xp, multiplier)
}

export async function addExpAndCheckLevel(m, conn, exp = 500) {
  let user = global.db.data.users[m.sender]
  user.exp += exp
  let before = user.level
  while (canLevelUp(user.level, user.exp)) user.level++
  if (before !== user.level) {
    await conn.sendMessage(m.chat, {
      text: `🎉 Selamat! Level kamu naik ke *${user.level}*! 🎊`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}