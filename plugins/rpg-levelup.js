let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user?.rpg) return m.reply('⚠️ Belum mulai RPG.')

  let levelSebelumnya = user.rpg.level
  let exp = user.rpg.exp

  // EXP yang dibutuhkan = level * 100
  let expNeeded = user.rpg.level * 100

  if (exp < expNeeded) {
    return m.reply(`📈 Kamu butuh ${expNeeded - exp} EXP lagi untuk naik level.`)
  }

  // Naik level
  user.rpg.exp -= expNeeded
  user.rpg.level += 1
  user.rpg.hp += 30
  user.rpg.atk += 5
  user.rpg.gold += 100

  m.reply(`🎉 Selamat! Kamu naik level ke ${user.rpg.level}!

❤️ +30 HP → ${user.rpg.hp}
🔪 +5 ATK → ${user.rpg.atk}
💰 +100 Gold → ${user.rpg.gold}
`)
}

handler.help = ['levelup']
handler.tags = ['rpg']
handler.command = /^levelup$/i

export default handler