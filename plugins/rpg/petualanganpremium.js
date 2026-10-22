/*
By Alecia Md
wa.me/6287842203625
Grup/saluran: https://chat.whatsapp.com/BuORXg43p6T0cjEedoGUWO
*/
let Fruatre = async (m, { conn, command, args, usedPrefix }) => {
  let user = global.db.data.users[m.sender]

  if (!user.premium) {
    return conn.reply(m.chat, `⚠️ Maaf, fitur ini hanya bisa diakses oleh pengguna premium. Silakan upgrade ke premium untuk menikmati fitur ini.`, m)
  }

  const locations = [
    '🗻 Gunung Emas',
    '🏝️ Pulau Kristal',
    '🏰 Istana Awan',
    '🌋 Kuil Lava',
    '🌌 Dunia Lain'
  ]

  let msg = `🧭 **Petualangan Eksklusif Premium** 🧭\n\nPilih salah satu lokasi untuk memulai petualangan:\n\n`
  locations.forEach((loc, idx) => {
    msg += `${idx + 1}. ${loc}\n`
  })
  msg += `\nKetik *${usedPrefix} petualanganpremium <nomor>* untuk memilih lokasi.`

  if (!args[0]) {
    return conn.reply(m.chat, msg, m)
  }

  let choice = parseInt(args[0]) - 1
  if (choice < 0 || choice >= locations.length) {
    return conn.reply(m.chat, `Pilihan tidak valid. Ketik nomor lokasi dengan benar!`, m)
  }

  let selectedLocation = locations[choice]
  conn.reply(m.chat, `🛤️ Kamu memulai petualangan di **${selectedLocation}**...`, m)

  let rewards = {
    money: Math.floor(Math.random() * 1000) + 500,  
    exp: Math.floor(Math.random() * 500) + 200,
    diamonds: Math.floor(Math.random() * 10) + 5,
    rareItem: Math.random() > 0.5 ? '💎 Diamond' : '⚔️ Senjata Langka'
  }

  setTimeout(() => {
    conn.reply(m.chat, `
🏅 **Hasil Petualangan di ${selectedLocation}:**
    
💵 Uang: +${rewards.money}
📈 EXP: +${rewards.exp}
💎 Diamond: +${rewards.diamonds}
🎁 Item Langka: ${rewards.rareItem}

⚔️ Terus berpetualang untuk mendapatkan hadiah yang lebih besar!`, m)

    user.money += rewards.money
    user.exp += rewards.exp
    user.diamonds += rewards.diamonds
    if (rewards.rareItem) {
      user.items.push(rewards.rareItem)
    }

  }, 3000) 
}

Fruatre.help = ['petualanganpremium']
Fruatre.tags = ['rpg']
Fruatre.command = /^(petualanganpremium|premiumadventure)$/i
Fruatre.register = true
Fruatre.group = true
Fruatre.rpg = true
Fruatre.premium = true

export default Fruatre