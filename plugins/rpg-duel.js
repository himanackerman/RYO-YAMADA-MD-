let handler = async (m, { conn, args }) => {
  let target = m.mentionedJid[0]
  if (!target) return m.reply('⚠️ Tag lawanmu. Contoh: *.duel @user*')

  let user1 = global.db.data.users[m.sender]
  let user2 = global.db.data.users[target]
  if (!user1?.rpg || !user2?.rpg) return m.reply('🔸 Kedua pemain harus mulai RPG dulu.')

  let p1atk = user1.rpg.atk, p2atk = user2.rpg.atk
  let p1hp = user1.rpg.hp, p2hp = user2.rpg.hp

  while (p1hp > 0 && p2hp > 0) {
    p2hp -= p1atk
    if (p2hp <= 0) break
    p1hp -= p2atk
  }

  let winner = p1hp > 0 ? m.sender : target
  let loser = p1hp > 0 ? target : m.sender

  conn.reply(m.chat, `⚔️ *Duel selesai!*\n🏆 Pemenang: @${winner.split`@`[0]}\n☠️ Kalah: @${loser.split`@`[0]}`, m, { mentions: [winner, loser] })
}

handler.help = ['duel @user']
handler.tags = ['rpg']
handler.command = /^duel$/i

export default handler