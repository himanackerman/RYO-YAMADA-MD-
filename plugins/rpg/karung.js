let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  user.botol = user.botol || 0
  user.kardus = user.kardus || 0
  user.kaleng = user.kaleng || 0
  user.gelas = user.gelas || 0
  user.plastik = user.plastik || 0

  let isi = [
    ['botol', '🧴 Botol'],
    ['kardus', '📦 Kardus'],
    ['kaleng', '🥫 Kaleng'],
    ['gelas', '🥛 Gelas'],
    ['plastik', '🛍️ Plastik']
  ]
  .map(([k, label]) => user[k] > 0 ? `✿ ${label} : ${user[k]}` : null)
  .filter(Boolean)
  .join('\n')

  let teks = isi
    ? `*\`ISI KARUNG KAMU\`*\n\n${isi}`
    : '📮 Karung kamu masih kosong!'

  m.reply(teks)
}

handler.help = ['karung']
handler.tags = ['rpg']
handler.command = /^(karung)$/i
handler.register = true
handler.group = true
handler.rpg = true

export default handler