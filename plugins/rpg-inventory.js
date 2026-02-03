let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  const fix = (v, d = 0) => (v == null ? d : v)

  let health = fix(user.health)
  let armor = fix(user.armor)
  let stamina = fix(user.energy)

  let sampah = fix(user.trash)
  let kayu = fix(user.wood)
  let batu = fix(user.rock)
  let aqua = fix(user.aqua)

  let kucing = fix(user.cat)
  let rubah = fix(user.fox)
  let serigala = fix(user.wolf)
  let naga = fix(user.dragon)
  let kuda = fix(user.horse)

  let makananpet = fix(user.petfood)

  let str = `
┌───⊷ *INFO USER* ⊷───⊷
┊➠ ❤️Health: *${health}*
┊➠ ♨️Stamina: *${stamina}*
┊➠ 🥋Armor: *${armor}*
┊➠ 💵Money: *${fix(user.money)}*
┊➠ 🎫Limit: *${fix(user.limit)}*
┊➠ 📊Level: *${fix(user.level)}*
┊➠ ✨Exp: *${fix(user.exp)}*
└────────────⊷

┌───⊷ *INVENTORY* ⊷───⊷
┊➠ 🥤Potion: *${fix(user.potion)}*
┊➠ ⛓️Iron: *${fix(user.iron)}*
┊➠ 🕸️String: *${fix(user.string)}*
┊➠ ⚔️Sword: *${fix(user.sword)}*
┊➠ 🗑Sampah: *${sampah}*
┊➠ 🪵Kayu: *${kayu}*
┊➠ 🪨Batu: *${batu}*
┊➠ 🍶Aqua: *${aqua}*
└───────────────────⊷

┌───⊷ *PET* ⊷───⊷
┊➠ 🐱Kucing: *${kucing}*
┊➠ 🐴Kuda: *${kuda}*
┊➠ 🐉Naga: *${naga}*
┊➠ 🦊Rubah: *${rubah}*
┊➠ 🐺Serigala: *${serigala}*
┊➠ 🍖Makanan Pet: *${makananpet}*
└────────────⊷
`.trim()

  conn.reply(m.chat, str, m)
}

handler.help = ['inv']
handler.tags = ['rpg']
handler.command = /^(inv|inventory)$/i
handler.limit = false
handler.rpg = true

export default handler