import fs from 'fs'
import similarity from 'similarity'

let timeout = 120000
let poin = 4999
const threshold = 0.72

let handler = async (m, { conn }) => {
  conn.tebakmakanan = conn.tebakmakanan ? conn.tebakmakanan : {}
  let id = m.chat

  if (id in conn.tebakmakanan)
    return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakmakanan[id][0])

  let src = JSON.parse(fs.readFileSync('./json/tebakmakanan.json', 'utf-8'))
  let json = src[Math.floor(Math.random() * src.length)]

  let caption = `
🍔 *TEBAK MAKANAN*

${json.deskripsi}

⏳ Timeout ${timeout / 1000} detik
💡 Ketik *teman* untuk bantuan
🏳️ Ketik *nyerah* untuk menyerah
🎁 Bonus: ${poin} XP
❤️ Kesempatan: 3x
`.trim()

  let msg = await conn.sendMessage(
    m.chat,
    { image: { url: json.img }, caption },
    { quoted: m }
  )

  conn.tebakmakanan[id] = [
    msg,
    { jawaban: (json.jawaban || '').toLowerCase().trim() },
    poin,
    3,
    setTimeout(() => {
      if (conn.tebakmakanan[id]) {
        conn.reply(m.chat, `⏰ Waktu habis!\nJawaban: *${json.jawaban}*`, msg)
        delete conn.tebakmakanan[id]
      }
    }, timeout)
  ]
}

handler.help = ['tebakmakanan']
handler.tags = ['game']
handler.command = /^tebakmakanan$/i
handler.limit = true

export default handler


handler.before = async function (m, { conn }) {
  conn.tebakmakanan = conn.tebakmakanan ? conn.tebakmakanan : {}
  let id = m.chat
  if (!(id in conn.tebakmakanan)) return
  if (!m.text) return

  let [msg, data, xp, chance, time] = conn.tebakmakanan[id]
  let teks = m.text.toLowerCase().replace(/\s+/g,' ').trim()
  let jawaban = data.jawaban

  if (teks === 'teman') {
    let hint = jawaban.replace(/[aiueo]/gi, '_')
    m.reply(`💡 Clue:\n\`\`\`${hint}\`\`\``)
    return true
  }

  if (/^((me)?nyerah|surr?ender)$/i.test(teks)) {
    clearTimeout(time)
    delete conn.tebakmakanan[id]
    m.reply(`🏳️ *Menyerah!*\nJawaban: *${jawaban}*`)
    return true
  }

  if (teks === jawaban) {
    clearTimeout(time)
    delete conn.tebakmakanan[id]
    global.db.data.users[m.sender].exp += xp
    m.reply(`🎉 *Benar!*\n+${xp} XP`)
    return true
  }

  if (similarity(teks, jawaban) >= threshold) {
    m.reply('*Dikit Lagi!*')
    return true
  }

  conn.tebakmakanan[id][3]--
  if (conn.tebakmakanan[id][3] <= 0) {
    clearTimeout(time)
    delete conn.tebakmakanan[id]
    m.reply(`💀 *Kesempatan habis!*\nJawaban: *${jawaban}*`)
  } else {
    m.reply(`❌ Salah!\n❤️ Sisa kesempatan: ${conn.tebakmakanan[id][3]}`)
  }

  return true
}

export const exp = 0