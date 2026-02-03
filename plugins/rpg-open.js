import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const THUMB = fs.readFileSync(path.join(__dirname, '../media/ryo1.jpg'))

const tfinventory = {
  others: { money: true },
  tfitems: {
    potion: true, trash: true, wood: true, rock: true, string: true,
    emerald: true, diamond: true, gold: true, iron: true,
  },
  tfcrates: { common: true, uncommon: true, mythic: true, legendary: true },
  tfpets: { horse: 10, cat: 10, fox: 10, dog: 10 }
}

const rewards = { /* === PUNYA KAMU, TIDAK DIUBAH === */ 
  common: {
    money: 101, trash: 11,
    potion: [0,1,0,1,0,0,0,0,0],
    common: [0,1,0,1,0,0,0,0,0,0],
    uncommon: [0,1,0,0,0,0,0,0,0,0,0,0]
  },
  uncommon: {
    money: 201, trash: 31,
    potion: [0,1,0,0,0,0,0,0],
    diamond: [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    common: [0,1,0,0,0,0,0,0,0],
    uncommon: [0,1,0,0,0,0,0,0,0,0,0],
    mythic: [0,1,0,0,0,0,0,0,0,0,0,0,0,0],
    wood: [0,1,0,0,0,0],
    rock: [0,1,0,0,0,0],
    string: [0,1,0,0,0,0]
  },
  mythic: {
    money: 301, exp: 50, trash: 61,
    potion: [0,1,0,0,0,0],
    emerald: [0,1,0,0,0,0,0,0,0,0,0,0,0],
    diamond: [0,1,0,0,1,0,0,1,0,0,0,0],
    gold: [0,1,0,0,0,0,1,0,0],
    iron: [0,1,0,0,0,0,0,0],
    common: [0,1,0,0,0,1],
    uncommon: [0,1,0,0,0,0,0,1],
    mythic: [0,1,0,0,0,0,1,0,0,0],
    legendary: [0,1,0,0,0,1,0,0,0,0,1,0,0],
    pet: [0,1,0,0,0,0,1,0,0,0,1],
    wood: [0,1,0,0,0],
    rock: [0,1,0,0,0],
    string: [0,1,0,0,0]
  },
  legendary: {
    money: 401, exp: 50, trash: 101,
    potion: [0,1,0,0,0],
    emerald: [0,0,0,0,0,0,0,0,1,0],
    diamond: [1,0,0,1,0,0,1,0,0,1],
    gold: [0,1,0,0,0,0,0,1],
    iron: [0,1,0,0,0,0,1],
    common: [0,1,0,1],
    uncommon: [0,1,0,0,0,1],
    mythic: [0,1,0,0,1,0,1,0,0],
    legendary: [1,0,0,0,1,0,0,0,0,1],
    pet: [0,1,0,0,0,0,1,0,0,1],
    wood: [0,1,0,1],
    rock: [0,1,0,1],
    string: [0,1,0,1]
  },
}

let handler = async (m, { conn, args, usedPrefix }) => {
  let user = global.db.data.users[m.sender]

  let listCrate = Object.fromEntries(Object.entries(rewards).filter(([v]) => v in user))

  let info = `🧑🏻‍🏫 ᴜsᴇʀ: *${user.registered ? user.name : conn.getName(m.sender)}*

🔖 ᴄʀᴀᴛᴇ ʟɪsᴛ :
${Object.keys(tfinventory.tfcrates).map(v => user[v] && `⮕ ${global.rpg.emoticon(v)} ${v}: ${user[v]}`).filter(v => v).join('\n')}
––––––––––––––––––––
💁🏻‍♂ ᴛɪᴩ :
⮕ ᴏᴩᴇɴ ᴄʀᴀᴛᴇ:
${usedPrefix}open [crate] [quantity]
★ ᴇxᴀᴍᴩʟᴇ:
${usedPrefix}open mythic 3
`.trim()

  let type = (args[0] || '').toLowerCase()
  let count = Math.floor(isNumber(args[1]) ? Math.min(Math.max(parseInt(args[1]), 1), Number.MAX_SAFE_INTEGER) : 1)

  if (!(type in listCrate)) {
    return await conn.reply(m.chat, info, m, {
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 1,
          title: 'RPG Crate',
          body: 'Open your crate',
          thumbnail: THUMB,
          renderLargerThumbnail: true,
          sourceUrl: ''
        }
      }
    })
  }

  if (user[type] < count)
    return m.reply(`Crate kamu kurang, cuma ada ${user[type]} ${global.rpg.emoticon(type)}${type}`)

  let crateReward = {}
  for (let i = 0; i < count; i++)
    for (let [reward, value] of Object.entries(listCrate[type]))
      if (reward in user) {
        const total = value.getRandom()
        if (total) {
          user[reward] += total
          crateReward[reward] = (crateReward[reward] || 0) + total
        }
      }

  user[type] -= count

  m.reply(`
Kamu membuka *${count}* ${global.rpg.emoticon(type)}${type} crate dan mendapatkan:
${Object.keys(crateReward).map(r => `*${global.rpg.emoticon(r)}${r}:* ${crateReward[r]}`).join('\n')}
`.trim())
}

handler.help = ['open [crate] [count]']
handler.tags = ['rpg']
handler.command = /^(open|buka|gacha)$/i
handler.register = true
handler.group = true
handler.rpg = true
export default handler

function isNumber(number) {
  if (!number) return false
  number = parseInt(number)
  return typeof number == 'number' && !isNaN(number)
}