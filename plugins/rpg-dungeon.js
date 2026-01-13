let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user?.rpg) return m.reply('⚠️ Belum mulai RPG.')

  const boss = { nama: 'Naga Hitam', hp: 150, atk: 25 }
  const playerAtk = user.rpg.atk
  const playerHP = user.rpg.hp
  let hasil

  if (playerHP < boss.atk) {
    hasil = '❌ Kamu terlalu lemah dan dikalahkan Naga Hitam...'
    user.rpg.hp = 0
  } else {
    let goldDrop = Math.floor(Math.random() * 100 + 100)
    let expDrop = Math.floor(Math.random() * 50 + 50)
    user.rpg.gold += goldDrop
    user.rpg.exp += expDrop
    hasil = `🔥 Kamu berhasil mengalahkan *${boss.nama}*!\n📈 +${expDrop} EXP | 💰 +${goldDrop} gold`
  }

  m.reply(hasil)
}

handler.help = ['dungeon']
handler.tags = ['rpg']
handler.command = /^dungeon$/i

export default handler