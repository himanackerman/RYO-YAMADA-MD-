import fetch from 'node-fetch'
import similarity from 'similarity'

let timeout = 120000
let poin = 500
const threshold = 0.72

let handler = async (m, { conn }) => {
  conn.tebakanime = conn.tebakanime ? conn.tebakanime : {}

  let id = m.chat
  if (id in conn.tebakanime)
    return conn.reply(m.chat, '❗Masih Ada Soal Yang Belum Terjawab', conn.tebakanime[id][0])

  let src = await (await fetch('https://raw.githubusercontent.com/unx21/ngetezz/main/src/data/nyenyenye.json')).json()
  let json = src[Math.floor(Math.random() * src.length)]

  let caption = `
🖼️ *TEBAK ANIME*

⏱️ Timeout ${timeout / 1000} detik
💎 Bonus ${poin} XP

Ketik *nyerah* untuk menyerah
`.trim()

  let msg = await conn.sendMessage(
    m.chat,
    { image: { url: json.img }, caption },
    { quoted: m }
  )

  conn.tebakanime[id] = [
    msg,
    { jawaban: (json.jawaban || '').toLowerCase().trim() },
    poin,
    setTimeout(() => {
      if (conn.tebakanime[id]) {
        conn.reply(m.chat, `⏰ Waktu habis!\nJawaban: *${json.jawaban}*`, msg)
        delete conn.tebakanime[id]
      }
    }, timeout)
  ]
}

handler.help = ['tebakanime']
handler.tags = ['game']
handler.command = /^tebakanime$/i
handler.group = true
handler.limit = true

export default handler


handler.before = async function (m, { conn }) {
  conn.tebakanime = conn.tebakanime ? conn.tebakanime : {}

  let id = m.chat
  if (!(id in conn.tebakanime)) return

  let [msg, data, xp, time] = conn.tebakanime[id]
  if (!m.text) return

  let teks = m.text.toLowerCase().replace(/\s+/g,' ').trim()
  let jawaban = data.jawaban

  if (/^((me)?nyerah|surr?ender)$/i.test(teks)) {
    clearTimeout(time)
    delete conn.tebakanime[id]
    m.reply(`🏳️ *Menyerah!*\nJawaban: *${jawaban}*`)
    return true
  }

  if (teks === jawaban) {
    clearTimeout(time)
    delete conn.tebakanime[id]
    global.db.data.users[m.sender].exp += xp
    m.reply(`🎉 *Benar!*\n+${xp} XP`)
    return true
  }

  if (similarity(teks, jawaban) >= threshold) {
    m.reply('🤏 Dikit lagi!')
    return true
  }

  return true
}