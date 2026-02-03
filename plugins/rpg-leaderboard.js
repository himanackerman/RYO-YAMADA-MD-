/*

# Fitur : Leaderboard
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : lokal / database.json

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/
import { areJidsSameUser } from '@adiwajshing/baileys'

Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)]
}

const leaderboards = [
  'atm','level','exp','money','limit','iron','gold','diamond','emerald','trash','potion',
  'wood','rock','string','umpan','petfood','common','uncommon','mythic','legendary','pet',
  'bank','chip','garam','minyak','gandum','steak','ayam_goreng',
  'ribs','roti','udang_goreng','bacon'
]

leaderboards.sort((a,b)=>a.localeCompare(b))

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let users = Object.entries(global.db.data.users).map(([jid, data]) => ({ ...data, jid }))

  let type = (args[0] || '').toLowerCase()
  let list = leaderboards.filter(v => users.some(u => u[v] > 0))

  if (!list.includes(type)) {
    return conn.reply(m.chat, `
🔖 type list :
${list.map(v => `⮕ ${global.rpg.emoticon(v)} ${v}`).join('\n')}

Contoh:
${usedPrefix + command} money
`.trim(), m, {
      contextInfo: {
        externalAdReply: {
          title: 'LEADERBOARD',
          body: 'Top Player RPG',
          thumbnailUrl: flaImg.getRandom() + 'LEADERBOARD',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })
  }

  let sorted = users
    .map(v => ({ jid: v.jid, val: v[type] || 0, name: v.registered ? v.name : conn.getName(v.jid) }))
    .sort((a,b)=> b.val - a.val)

  let rank = sorted.findIndex(v => areJidsSameUser(v.jid, m.sender)) + 1

  let text = `
🏆 Rank kamu: ${rank} dari ${sorted.length}

*• ${global.rpg.emoticon(type)} ${type.toUpperCase()} •*

${sorted.slice(0,10).map((v,i)=>
`${i+1}. (${toRupiah(v.val)}) - ${v.name}
wa.me/${v.jid.split('@')[0]}`
).join('\n\n')}
`.trim()

  conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      externalAdReply: {
        title: 'Leaderboard ' + type,
        body: 'Top 10 Player',
        thumbnailUrl: flaImg.getRandom() + type,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['lb <type>', 'leaderboard']
handler.tags = ['xp', 'rpg']
handler.command = /^(leaderboard|lb)$/i
handler.rpg = true
handler.group = true
handler.register = true
export default handler

const flaImg = [
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&fontsize=100&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=100&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&fontsize=100&text='
]

const toRupiah = n => parseInt(n).toLocaleString().replace(/,/g,'.')