let handler = async (m, { args }) => {
  let user = global.db.data.users[m.sender]
  if (!user?.rpg) return m.reply('⚠️ Belum mulai RPG.')

  const item = args.join(' ')
  if (!item) return m.reply('📦 Contoh: *.jual Taring*')

  let index = user.rpg.inventory.findIndex(i => i.toLowerCase() === item.toLowerCase())
  if (index === -1) return m.reply('❌ Item tidak ada di inventory.')

  let harga = Math.floor(Math.random() * 50 + 20)
  user.rpg.gold += harga
  user.rpg.inventory.splice(index, 1)

  m.reply(`✅ Kamu menjual *${item}* seharga 💰 ${harga} gold.\nSisa gold: ${user.rpg.gold}`)
}

handler.help = ['jual <item>']
handler.tags = ['rpg']
handler.command = /^jual$/i

export default handler