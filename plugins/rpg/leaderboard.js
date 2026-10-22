import { areJidsSameUser } from 'baileys'

Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)]
}

const leaderboards = [
  'atm',
  'level',
  'exp',
  'money',
  'limit',
  'bank',
  'chip',

  'iron',
  'gold',
  'diamond',
  'emerald',

  'trash',
  'potion',
  'wood',
  'rock',
  'string',
  'umpan',
  'petfood',

  'common',
  'uncommon',
  'mythic',
  'legendary',
  'pet',

  'garam',
  'minyak',
  'gandum',
  'steak',
  'ayam_goreng',
  'ribs',
  'roti',
  'udang_goreng',
  'bacon',

  'apel',
  'anggur',
  'jeruk',
  'mangga',
  'pisang',

  'bibitapel',
  'bibitanggur',
  'bibitjeruk',
  'bibitmangga',
  'bibitpisang',

  'horse',
  'cat',
  'fox',
  'robo',
  'dragon',
  'lion',
  'rhinoceros',
  'centaur',
  'kyubi',
  'griffin',
  'phonix',
  'wolf',

  'armor',
  'sword',
  'pickaxe',
  'fishingrod'
]

leaderboards.sort((a, b) => a.localeCompare(b))

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let users = Object.entries(global.db.data.users)
    .map(([jid, data]) => ({ ...data, jid }))

  let type = (args[0] || '').toLowerCase()

  let list = leaderboards.filter(v =>
    users.some(u => (u[v] || 0) > 0)
  )

  if (!list.includes(type)) {
    let txt = `
🏆 *LEADERBOARD RPG*

📋 Tipe yang tersedia:

${list.map(v => `${global.rpg.emoticon(v)} ${v}`).join('\n')}

Contoh:
${usedPrefix + command} money
${usedPrefix + command} level
${usedPrefix + command} diamond
`.trim()

    return conn.sendMessage(m.chat, {
      image: {
        url: flaImg.getRandom() + 'LEADERBOARD'
      },
      caption: txt
    }, { quoted: m })
  }

  let sorted = users
    .map(v => ({
      jid: v.jid,
      val: v[type] || 0,
      name: v.registered
        ? v.name
        : conn.getName(v.jid)
    }))
    .sort((a, b) => b.val - a.val)

  let rank =
    sorted.findIndex(v =>
      areJidsSameUser(v.jid, m.sender)
    ) + 1

  let text = `
🏆 *LEADERBOARD ${type.toUpperCase()}*

👤 Rank Kamu: *${rank}*
👥 Total Player: *${sorted.length}*

${sorted
  .slice(0, 10)
  .map((v, i) =>
`${i + 1}. ${v.name}
${global.rpg.emoticon(type)} ${toRupiah(v.val)}`
  )
  .join('\n\n')}
`.trim()

  await conn.sendMessage(m.chat, {
    image: {
      url: flaImg.getRandom() + type
    },
    caption: text
  }, { quoted: m })
}

handler.help = ['lb <type>', 'leaderboard']
handler.tags = ['rpg']
handler.command = /^(leaderboard|lb)$/i
handler.group = true
handler.register = true
handler.rpg = true

export default handler

const flaImg = [
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&fontsize=100&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=100&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&fontsize=100&text='
]

function toRupiah(n) {
  return parseInt(n || 0).toLocaleString('id-ID')
}