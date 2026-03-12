import fs from 'fs'
import similarity from 'similarity'

let timeout = 120000
let poin = 4999
const threshold = 0.72

let handler = async (m, { conn }) => {
  conn.game = conn.game ? conn.game : {}
  let id = 'tebaktebakan-' + m.chat

  if (id in conn.game)
    return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.game[id][0])

  let src = JSON.parse(fs.readFileSync('./json/tebaktebakan.json', 'utf-8'))
  let json = src[Math.floor(Math.random() * src.length)]

  let caption = `
❓ *TEBAK TEBAKAN*

${json.soal}

⏳ Timeout ${timeout / 1000} detik
💡 Ketik *hkan* untuk bantuan
🏳️ Ketik *nyerah* untuk menyerah
🎁 Bonus: ${poin} XP
`.trim()

  let msg = await m.reply(caption)

  conn.game[id] = [
    msg,
    { jawaban: (json.jawaban || '').toLowerCase().trim() },
    poin,
    setTimeout(() => {
      if (conn.game[id]) {
        conn.reply(m.chat, `⏰ Waktu habis!\nJawaban: *${json.jawaban}*`, msg)
        delete conn.game[id]
      }
    }, timeout)
  ]
}

handler.help = ['tebaktebakan']
handler.tags = ['game']
handler.command = /^tebaktebakan$/i
handler.onlyprem = true
handler.game = true
handler.limit = true

export default handler


handler.before = async function (m, { conn }) {
  conn.game = conn.game ? conn.game : {}
  let id = 'tebaktebakan-' + m.chat
  if (!(id in conn.game)) return
  if (!m.text) return

  let [msg, data, xp, time] = conn.game[id]
  let teks = m.text.toLowerCase().replace(/\s+/g,' ').trim()
  let jawaban = data.jawaban

  if (teks === 'hkan') {
    let hint = jawaban.replace(/[aiueo]/gi, '_')
    m.reply(`💡 Clue:\n\`\`\`${hint}\`\`\``)
    return true
  }

  if (/^((me)?nyerah|surr?ender)$/i.test(teks)) {
    clearTimeout(time)
    delete conn.game[id]
    m.reply(`🏳️ *Menyerah!*\nJawaban: *${jawaban}*`)
    return true
  }

  if (teks === jawaban) {
    clearTimeout(time)
    delete conn.game[id]
    global.db.data.users[m.sender].exp += xp
    m.reply(`🎉 *Benar!*\n+${xp} XP`)
    return true
  }

  if (similarity(teks, jawaban) >= threshold) {
    m.reply('*Dikit Lagi!*')
    return true
  }

  m.reply('*Salah!*')
  return true
}

export const exp = 0