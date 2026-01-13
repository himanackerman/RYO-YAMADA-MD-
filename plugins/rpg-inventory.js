let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user?.rpg) return m.reply('⚠️ Belum mulai RPG.')

  let inv = user.rpg.inventory
  if (!inv.length) return m.reply('🎒 Tasmu kosong.')

  m.reply(`🎒 *Inventory Kamu:*\n- ${inv.join('\n- ')}`)
}

handler.help = ['inventory']
handler.tags = ['rpg']
handler.command = /^inventory$/i
handler.limit = false

export default handler