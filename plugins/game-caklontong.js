import fs from 'fs'
import similarity from 'similarity'

let timeout = 120000
let poin = 4999
let bonusLimit = 5
const threshold = 0.72

let handler = async (m, { conn }) => {
  conn.caklontong = conn.caklontong ? conn.caklontong : {}
  let id = 'caklontong-' + m.chat

  if (id in conn.caklontong)
    return m.reply('Masih ada soal belum terjawab di chat ini')

  let src = JSON.parse(fs.readFileSync('./json/caklontong.json', 'utf-8'))
  let json = src[Math.floor(Math.random() * src.length)]

  let caption = `
 *CAK LONTONG*

${json.soal}

⏳ Timeout ${timeout/1000} detik
💡 Ketik *calo* untuk bantuan
🏳️ Ketik *nyerah* untuk menyerah
🎁 Bonus: ${poin} XP
🎟️ Reward: +${bonusLimit} Limit
`.trim()

  let msg = await m.reply(caption)

  conn.caklontong[id] = [
    msg,
    {
      jawaban: (json.jawaban || '').toLowerCase().replace(/\s+/g,' ').trim(),
      deskripsi: json.deskripsi || ''
    },
    poin,
    setTimeout(() => {
      if (conn.caklontong[id]) {
        conn.reply(
          m.chat,
          `⏰ Waktu habis!\nJawaban: *${json.jawaban}*\n${json.deskripsi}`,
          msg
        )
        delete conn.caklontong[id]
      }
    }, timeout)
  ]
}

handler.help = ['caklontong']
handler.tags = ['game']
handler.command = /^caklontong$/i

export default handler


handler.before = async function (m, { conn }) {
  conn.caklontong = conn.caklontong ? conn.caklontong : {}
  let id = 'caklontong-' + m.chat
  if (!(id in conn.caklontong)) return
  if (!m.text) return

  let [msg, data, xp, time] = conn.caklontong[id]
  let teks = m.text.toLowerCase().replace(/\s+/g,' ').trim()
  let jawaban = data.jawaban

  if (teks === 'calo') {
    let clue = jawaban.replace(/[aiueo]/gi,'_')
    m.reply(`💡 Clue:\n\`\`\`${clue}\`\`\``)
    return true
  }

  if (/^((me)?nyerah|surr?ender)$/i.test(teks)) {
    clearTimeout(time)
    delete conn.caklontong[id]
    m.reply(`🏳️ *Menyerah!*\nJawaban: *${jawaban}*\n${data.deskripsi}`)
    return true
  }

  if (teks === jawaban) {
    clearTimeout(time)
    delete conn.caklontong[id]

    let user = global.db.data.users[m.sender]
    user.exp += xp
    user.limit += bonusLimit

    m.reply(`🎉 *Benar!*\n+${xp} XP\n+${bonusLimit} 🎟️ Limit\n\n${data.deskripsi}`)
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