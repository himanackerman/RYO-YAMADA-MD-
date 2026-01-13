import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'
import fs from 'fs'
import fetch from 'node-fetch'

const defaultMenu = {
  before: `
● Nama:  %name
● Nomor: %tag
● Premium: %prems
● Limit: %limit
● Role: %role

${ucapan()} %name!
● Tanggal: %week %weton
● Date: %date
● Tanggal Islam: %dateIslamic
● Waktu: %time

● Nama Bot: %me
● Mode: %mode
● Prefix: [ %_p ]
● Platform: %platform
● Type: Node.JS
● Uptime: %uptime
● Database: %rtotalreg dari %totalreg

⬣───「 INFO CMD 」───⬣
│ Ⓟ = Premium
│ Ⓛ = Limit
▣────────────⬣
%readmore
`.trimStart(),
  header: '╭─────『 %category 』',
  body: '    ᯓ %cmd %isPremium %islimit',
  footer: '╰–––––––––––––––༓',
  after: ``,
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  if (m.isGroup && !global.db.data.chats[m.chat].menu)
    throw '⚠️ Admin telah mematikan menu'

  try {
    let lprem = 'Ⓟ'
    let llim = 'Ⓛ'
    let tag = '@' + m.sender.split('@')[0]

    let d = new Date(Date.now() + 3600000)
    let locale = 'id'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    let weton = ['Pahing','Pon','Wage','Kliwon','Legi'][Math.floor(d/84600000) % 5]
    let dateIslamic = Intl.DateTimeFormat('id-TN-u-ca-islamic', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString('id', {
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    })
    let uptime = clockString(process.uptime() * 1000)

    let { age, exp, limit, level, role, money } = global.db.data.users[m.sender]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)
    let premium = global.db.data.users[m.sender].premiumTime
    let prems = premium > 0 ? 'Premium' : 'Free'
    let platform = os.platform()

    let mode = global.db.data.settings?.[conn.user.jid]?.public
      ? 'Public' : 'Self'

    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users)
      .filter(u => u.registered).length

    let help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium,
        enabled: !p.disabled,
      }))

    let tags = {
      'main': '⚔️ Main Menu',
      'ai': '🤖 AI Feature',
      'memfess': '💌 Memfess',
      'downloader': '⬇️ Downloader',
      'internet': '🌐 Internet',
      'anime': '🗡️ Anime',
      'sticker': '✨ Sticker',
      'tools': '🛠️ Tools',
      'group': '👥 Group',
      'fun': '🎮 Fun',
      'search': '🔍 Search',
      'game': '⚡ Game',
      'info': 'ℹ️ Info',
      'owner': '👑 Owner',
      'quotes': '📜 Quotes',
      'exp': '📈 Exp',
      'stalk': '🕵️ Stalk',
      'rpg': '🏹 RPG',
      'sound': '🎶 Sound',
      'audio': '🎧 Audio',
      'random': '🎲 Random',
      'maker': '🎨 Maker',
      'panel': '🖥️ Panel',
      'nsfw': '🍭 NSFW'
    }

    let before = defaultMenu.before
    let header = defaultMenu.header
    let body = defaultMenu.body
    let footer = defaultMenu.footer
    let after = defaultMenu.after

    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(m => m.tags && m.tags.includes(tag))
            .map(menu => menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%_p' + help)
                .replace(/%islimit/g, menu.limit ? llim : '')
                .replace(/%isPremium/g, menu.premium ? lprem : '')
                .trim()
            }).join('\n')),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')

    let replace = {
      '%': '%',
      uptime,
      me: conn.user.name,
      mode,
      tag,
      platform,
      _p,
      money,
      age,
      name,
      prems,
      level,
      limit,
      weton,
      week,
      date,
      dateIslamic,
      time,
      totalreg,
      rtotalreg,
      role,
      readmore: readMore
    }

    let text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a,b)=>b.length-a.length).join`|`})`, 'g'),
      (_, name) => replace[name]
    )

    const menuAdReply = {
      contextInfo: {
        externalAdReply: {
          title: '✨ Ryo Yamada MD',
          body: 'Pilih kategori fitur yang ingin kamu pakai 💫',
          thumbnail: await (await fetch(
            "https://eiiuzfmbewjlwfjz.public.blob.vercel-storage.com/YnU5WMiCgO_file.jpeg"
          )).buffer(),
          mediaType: 1,
          previewType: "PHOTO",
          renderLargerThumbnail: true,
          sourceUrl: "https://github.com/himanackerman"
        }
      }
    }

    await conn.sendMessage(
      m.chat,
      { text: text.trim(), mentions: [m.sender], ...menuAdReply },
      { quoted: global.fkontak }
    )

    try {
      let vn = fs.readFileSync('./media/tes.mp3')
      await conn.sendFile(
        m.chat,
        vn,
        'tes.mp3',
        '',
        global.fkontak,
        true,
        { type: 'audioMessage', ptt: true }
      )
    } catch {}

  } catch (e) {
    conn.reply(m.chat, '⚠️ Menu sedang error', m)
    throw e
  }
}

handler.help = ['allmenu']
handler.tags = ['main']
handler.command = /^(allmenu|help|\?)$/i
export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return `${h} H ${m} M ${s} S`
}

function ucapan() {
  const time = moment.tz('Asia/Jakarta').format('HH')
  if (time >= 4 && time < 10) return "Pagi Kak 🌄"
  if (time >= 10 && time < 15) return "Siang Kak ☀️"
  if (time >= 15 && time < 18) return "Sore Kak 🌇"
  return "Malam Kak 🌙"
}