import fs from 'fs'
import similarity from 'similarity'

let timeout = 180000
let money = 5000
let limit = 1
const threshold = 0.72

let handler = async (m, { conn, usedPrefix }) => {
  conn.game = conn.game ? conn.game : {}
  let id = 'susunkata-' + m.chat

  if (id in conn.game)
    return conn.reply(m.chat, '*ᴍᴀꜱɪʜ ᴀᴅᴀ ꜱᴏᴀʟ ʙᴇʟᴜᴍ ᴛᴇʀᴊᴀᴡᴀʙ ᴅɪ ᴄʜᴀᴛ ɪɴɪ!!*', conn.game[id][0])

  let src = JSON.parse(fs.readFileSync('./json/susunkata.json', 'utf-8'))
  let json = src[Math.floor(Math.random() * src.length)]

  let caption = `
${json.soal}

📮 Tipe : ${json.tipe}
⏳ Timeout ${(timeout / 1000)} detik
💬 Ketik *suska* untuk bantuan
➕ Bonus: ${money} Money
🎟️ Limit: ${limit} Limit
`.trim()

  let msg = await conn.reply(m.chat, caption, m)

  conn.game[id] = [
    msg,
    { jawaban: (json.jawaban || '').toLowerCase().trim() },
    money,
    setTimeout(() => {
      if (conn.game[id]) {
        conn.reply(m.chat, `⏰ Waktu habis!\n📑 Jawaban: *${json.jawaban}*`, msg)
        delete conn.game[id]
      }
    }, timeout)
  ]
}

handler.help = ['susunkata']
handler.tags = ['game']
handler.command = /^susunkata|sskata$/i
handler.limit = true
handler.game = true
handler.onlyprem = true

export default handler


handler.before = async function (m, { conn }) {
  conn.game = conn.game ? conn.game : {}
  let id = 'susunkata-' + m.chat
  if (!(id in conn.game)) return

  let [msg, data, hadiah, time] = conn.game[id]
  if (!m.text) return

  let teks = m.text.toLowerCase().replace(/\s+/g,' ').trim()
  let jawaban = data.jawaban

  if (teks === 'suska') {
    let hint = jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')
    m.reply(`💡 Hint:\n\`\`\`${hint}\`\`\``)
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
    global.db.data.users[m.sender].money += hadiah
    global.db.data.users[m.sender].limit += 1
    m.reply(`*🎉 BENAR! 🎉*\n+${hadiah} 💰Money\n+1 🎫Limit`)
    return true
  }

  if (similarity(teks, jawaban) >= threshold) {
    m.reply('*Dikit Lagi!*')
    return true
  }

  return true
}

export const exp = 0