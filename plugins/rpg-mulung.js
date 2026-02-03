const timeout = 300000 // 5 menit

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  let last = user.lastmulung || 0
  let now = new Date * 1
  if (now - last < timeout) {
    let sisa = clockString(timeout - (now - last))
    return m.reply(`Kamu capek mulung...\nTunggu ${sisa} lagi`)
  }

  user.botol = user.botol || 0
  user.kardus = user.kardus || 0
  user.kaleng = user.kaleng || 0
  user.gelas = user.gelas || 0
  user.plastik = user.plastik || 0

  let hasil = {
    botol: Math.floor(Math.random() * 10),
    kardus: Math.floor(Math.random() * 8),
    kaleng: Math.floor(Math.random() * 7),
    gelas: Math.floor(Math.random() * 6),
    plastik: Math.floor(Math.random() * 12)
  }

  user.botol += hasil.botol
  user.kardus += hasil.kardus
  user.kaleng += hasil.kaleng
  user.gelas += hasil.gelas
  user.plastik += hasil.plastik

  user.lastmulung = now

  m.reply(`
♻️ *Kamu selesai mulung dan menemukan:*

🧴 Botol: ${hasil.botol}
📦 Kardus: ${hasil.kardus}
🥫 Kaleng: ${hasil.kaleng}
🍶 Gelas: ${hasil.gelas}
🛍 Plastik: ${hasil.plastik}

Cek isi karung: *.karung*
`.trim())
}

handler.help = ['mulung']
handler.tags = ['rpg']
handler.command = /^(mulung)$/i
handler.group = true
handler.rpg = true
handler.energy = 5

export default handler

function clockString(ms) {
  let m = Math.floor(ms / 60000)
  let s = Math.floor(ms / 1000) % 60
  return `${m}m ${s}s`
}