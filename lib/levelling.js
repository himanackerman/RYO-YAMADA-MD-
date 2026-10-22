export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75

export const MAX_LEVEL = 10000
export const MAX_EXP = 1e12

export function xpRange(level, multiplier = Number(global.multiplier) || 1) {
  if (level < 0) throw new TypeError('level tidak boleh negatif')

  level = Math.floor(level)

  if (!Number.isFinite(level)) level = MAX_LEVEL
  if (level > MAX_LEVEL) level = MAX_LEVEL

  let min = level === 0
    ? 0
    : Math.round(Math.pow(level, growth) * multiplier) + 1

  let max = Math.round(Math.pow(level + 1, growth) * multiplier)

  if (!Number.isFinite(min)) min = MAX_EXP
  if (!Number.isFinite(max)) max = MAX_EXP

  return {
    min,
    max,
    xp: Math.max(0, max - min)
  }
}

export function findLevel(xp, multiplier = Number(global.multiplier) || 1) {
  if (!Number.isFinite(xp)) return MAX_LEVEL
  if (xp <= 0) return 0

  xp = Math.min(xp, MAX_EXP)

  let low = 0
  let high = MAX_LEVEL

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const range = xpRange(mid, multiplier)

    if (range.min <= xp) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return Math.max(0, high)
}

export function canLevelUp(level, xp, multiplier = Number(global.multiplier) || 1) {
  if (level < 0) return false
  if (!Number.isFinite(xp) || xp <= 0) return false

  return level < findLevel(xp, multiplier)
}

export async function addExpAndCheckLevel(m, conn, exp = 500) {
  const user = global.db?.data?.users?.[m.sender]
  if (!user) return

  if (!Number.isFinite(user.exp))
    user.exp = 0

  if (!Number.isFinite(user.level))
    user.level = 0

  user.exp = Math.min(
    (user.exp || 0) + (Number(exp) || 0),
    MAX_EXP
  )

  const before = user.level
  const after = findLevel(user.exp)

  if (after > before) {
    user.level = Math.min(after, MAX_LEVEL)

    await conn.sendMessage(m.chat, {
      text: `🎉 Selamat! Level kamu naik ke *${user.level}*! 🎊`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}