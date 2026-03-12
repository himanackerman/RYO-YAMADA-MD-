import fs from 'fs'
import similarity from 'similarity'

let timeout = 120000
let poin = 4999
const threshold = 0.72

let handler = async (m, { conn, usedPrefix }) => {
  conn.lengkapikalimat = conn.lengkapikalimat ? conn.lengkapikalimat : {}

  let id = m.chat
  if (id in conn.lengkapikalimat)
    return m.reply('Masih ada soal yang belum terjawab di chat ini!')

  let src = JSON.parse(fs.readFileSync('./json/lengkapikalimat.json'))
  let json = src[Math.floor(Math.random() * src.length)]

  let soal = json.soal || '-'
  let jawaban = (json.jawaban || '').toLowerCase().trim()

  let caption = `
*LENGKAPI KALIMAT*

${soal}

⏱️ Timeout ${(timeout / 1000)} detik
💎 Bonus ${poin} XP

Ketik *nyerah* untuk menyerah
`.trim()

  let msg = await m.reply(caption)

  conn.lengkapikalimat[id] = [
    msg,
    { soal, jawaban },
    poin,
    setTimeout(() => {
      if (conn.lengkapikalimat[id]) {
        m.reply(`⏰ Waktu habis!\nJawaban: *${jawaban}*`)
        delete conn.lengkapikalimat[id]
      }
    }, timeout)
  ]
}

handler.help = ['lengkapikalimat']
handler.tags = ['game']
handler.command = /^lengkapikalimat$/i
handler.limit = true

export default handler

handler.before = async function (m, { conn }) {
  conn.lengkapikalimat = conn.lengkapikalimat ? conn.lengkapikalimat : {}

  let id = m.chat
  if (!(id in conn.lengkapikalimat)) return

  let [msg, data, poin, time] = conn.lengkapikalimat[id]
  if (!m.text) return

  let teks = m.text.toLowerCase().replace(/\s+/g, ' ').trim()
  let jawaban = data.jawaban

  if (/^((me)?nyerah|surr?ender)$/i.test(teks)) {
    clearTimeout(time)
    delete conn.lengkapikalimat[id]
    m.reply(`🏳️ *Menyerah!*\nJawaban: *${jawaban}*`)
    return true
  }

  if (teks === jawaban) {
    clearTimeout(time)
    delete conn.lengkapikalimat[id]
    global.db.data.users[m.sender].exp += poin
    m.reply(`✅ *Benar!*\nJawaban: *${jawaban}*\n+${poin} XP`)
    return true
  }

  if (similarity(teks, jawaban) >= threshold) {
    m.reply('🤏 Dikit lagi!')
    return true
  }

  return true
}