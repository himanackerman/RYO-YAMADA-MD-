let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]
  let type = (args[0] || '').toLowerCase()

  user.lastKerjaRPG = user.lastKerjaRPG || 0

  const cooldown = 300000
  const now = new Date() * 1

  if (now - user.lastKerjaRPG < cooldown) {
    return m.reply(`Kamu sudah bekerja\nIstirahat ${clockString(cooldown - (now - user.lastKerjaRPG))}`)
  }

  let kerjaList = `
*List Kerjaan*
• ojek
• pedagang
• dokter
• petani
• montir
• kuli

Contoh: .kerja ojek
`.trim()

  if (!type) return m.reply(kerjaList)

  const rand = arr => arr[Math.floor(Math.random() * arr.length)]

  let uang = {
    ojek: 4000 + Math.floor(Math.random() * 2000),
    pedagang: 3500 + Math.floor(Math.random() * 2000),
    dokter: 9000 + Math.floor(Math.random() * 3000),
    petani: 5000 + Math.floor(Math.random() * 3000),
    montir: 4500 + Math.floor(Math.random() * 2000),
    kuli: 7000 + Math.floor(Math.random() * 3000),
  }

  let teks = {
    ojek: `Kamu mengantarkan ${rand(['mas mas','bapak bapak','cewe sma','emak emak'])}`,
    pedagang: `Ada pembeli membeli ${rand(['wortel','sawi','tomat','ikan','ayam'])}`,
    dokter: `Kamu menyembuhkan pasien ${rand(['sakit kepala','cedera','luka bakar'])}`,
    petani: `${rand(['Padi','Jeruk','Pisang','Semangka'])} berhasil dipanen`,
    montir: `Kamu memperbaiki ${rand(['motor','mobil','angkot','sepeda'])}`,
    kuli: `Kamu selesai ${rand(['membangun rumah','memperbaiki gedung','membangun fasilitas umum'])}`,
  }

  if (!(type in uang)) return m.reply(kerjaList)

  user.atm = (user.atm || 0) + uang[type]
  user.lastKerjaRPG = now

  m.reply(`${teks[type]}\nDan mendapatkan *Rp.${uang[type]}*`)
}

handler.help = ['kerja']
handler.tags = ['rpg']
handler.command = /^kerja$/i
handler.rpg = true
handler.group = true

export default handler

function clockString(ms) {
  let m = Math.floor(ms / 60000)
  let s = Math.floor(ms / 1000) % 60
  return `${m} menit ${s} detik`
}