/*
By Alecia Md
wa.me/6287842203625
Grup/saluran: https://chat.whatsapp.com/BuORXg43p6T0cjEedoGUWO
*/

let Fruatre = async (m, { conn, args, usedPrefix, command }) => {
  // Auto-inisialisasi user
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]

  if (!user.nama) user.nama = "Pemain"
  if (!user.level) user.level = 1
  if (!user.exp) user.exp = 0
  if (!user.gold) user.gold = 0
  if (!user.senjata) user.senjata = "Pedang"
  if (!user.armor) user.armor = "Baju Besi"

  if (args.length < 1) {
    return conn.reply(m.chat, `Contoh penggunaan: ${usedPrefix}romawi start, quest, fight, shop`, m)
  }

  if (args[0] === "start") {
    let caption = `*Selamat Datang di Romawi, ${user.nama}!*
*Kamu adalah seorang prajurit Romawi yang baru saja bergabung dengan legiun.*
*Kamu memiliki level ${user.level} dan ${user.exp} exp.*
*Kamu memiliki ${user.gold} gold.*
*Kamu memiliki senjata ${user.senjata} dan armor ${user.armor}.`
    return conn.reply(m.chat, caption, m)
  }

  if (args[0] === "quest") {
    let quest = pickRandom(["Membunuh 10 gajah", "Mengumpulkan 100 emas", "Membunuh 5 prajurit musuh"])
    let reward = pickRandom(["100 emas", "10 exp", "1 senjata baru"])
    let caption = `*Quest Baru!*
*Kamu harus ${quest} untuk mendapatkan ${reward}.`
    return conn.reply(m.chat, caption, m)
  }

  if (args[0] === "fight") {
    let musuh = pickRandom(["Prajurit musuh", "Gajah", "Singa"])
    let musuhLevel = Math.floor(Math.random() * 10) + 1
    let musuhExp = Math.floor(Math.random() * 100) + 1
    let musuhGold = Math.floor(Math.random() * 100) + 1
    let caption = `*Pertarungan!*
*Kamu melawan ${musuh} level ${musuhLevel} dengan ${musuhExp} exp dan ${musuhGold} gold.*
*Kamu memiliki level ${user.level} dan ${user.exp} exp.*
*Kamu memiliki senjata ${user.senjata} dan armor ${user.armor}.`
    return conn.reply(m.chat, caption, m)
  }

  if (args[0] === "shop") {
    let shop = ["Senjata baru", "Armor baru", "Potion"]
    let caption = `*Toko!*
*Kamu dapat membeli:*
*${shop[0]}: 100 emas*
*${shop[1]}: 200 emas*
*${shop[2]}: 50 emas*
*Kamu memiliki ${user.gold} emas.`
    return conn.reply(m.chat, caption, m)
  }
}

Fruatre.help = ["romawi"]
Fruatre.tags = ["rpg"]
Fruatre.command = /^(romawi)$/i
Fruatre.group = false
export default Fruatre

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}