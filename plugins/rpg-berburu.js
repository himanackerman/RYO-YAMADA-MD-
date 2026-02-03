let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (!user) return
  if (user.energy < 10) return m.reply('⚡ Energy kamu kurang untuk berburu!')

  user.banteng = user.banteng || 0
  user.harimau = user.harimau || 0
  user.gajah = user.gajah || 0
  user.kambing = user.kambing || 0
  user.panda = user.panda || 0
  user.buaya = user.buaya || 0
  user.kerbau = user.kerbau || 0
  user.sapi = user.sapi || 0
  user.monyet = user.monyet || 0
  user.ayam = user.ayam || 0
  user.babi = user.babi || 0
  user.babihutan = user.babihutan || 0

  const hasil = [
    ['banteng', '🐂 Banteng'],
    ['harimau', '🐅 Harimau'],
    ['gajah', '🐘 Gajah'],
    ['kambing', '🐐 Kambing'],
    ['panda', '🐼 Panda'],
    ['buaya', '🐊 Buaya'],
    ['kerbau', '🐃 Kerbau'],
    ['sapi', '🐮 Sapi'],
    ['monyet', '🐒 Monyet'],
    ['ayam', '🐓 Ayam'],
    ['babi', '🐖 Babi'],
    ['babihutan', '🐗 Babi Hutan']
  ]

  let dapat = hasil[Math.floor(Math.random() * hasil.length)]
  let jumlah = Math.floor(Math.random() * 3) + 1

  user[dapat[0]] += jumlah
  user.money += jumlah * 50
  user.exp += jumlah * 20
  user.energy -= 10

  m.reply(`
🏹 *BERBURU BERHASIL*

Kamu mendapatkan:
${dapat[1]} : ${jumlah}

💰 Money +${jumlah * 50}
✨ Exp +${jumlah * 20}
⚡ Energy -10
`.trim())
}

handler.help = ['berburu']
handler.tags = ['rpg']
handler.command = /^(berburu|hunt)$/i
handler.group = true
handler.rpg = true
handler.energy = 10

export default handler