let handler = async (m, { args }) => {
  let user = global.db.data.users[m.sender]
  if (!user?.rpg) return m.reply('⚠️ Belum mulai RPG.')

  const type = (args[0] || '').toLowerCase()
  const biaya = 50

  if (!['atk', 'hp'].includes(type)) {
    return m.reply('⚠️ Contoh: *.upgrade atk* atau *.upgrade hp*')
  }

  if (user.rpg.gold < biaya) {
    return m.reply('💰 Gold kamu kurang untuk upgrade.')
  }

  user.rpg.gold -= biaya
  if (type === 'atk') user.rpg.atk += 5
  if (type === 'hp') user.rpg.hp += 20

  m.reply(`✅ Berhasil upgrade ${type.toUpperCase()}!\n🔪 ATK: ${user.rpg.atk}\n❤️ HP: ${user.rpg.hp}\n💰 Sisa gold: ${user.rpg.gold}`)
}

handler.help = ['upgrade <atk|hp>']
handler.tags = ['rpg']
handler.command = /^upgrade$/i

export default handler