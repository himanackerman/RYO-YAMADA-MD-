import fs from 'fs'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
  conn.siapakahaku = conn.siapakahaku ? conn.siapakahaku : {}

  let id = m.chat
  if (id in conn.siapakahaku) return m.reply('Masih ada soal yang belum terjawab di chat ini!')

  let src = JSON.parse(fs.readFileSync('./json/siapakahaku.json'))
  let json = src[Math.floor(Math.random() * src.length)]

  let caption = `
*SIAPAKAH AKU*

${json.soal}

⏱️ Timeout ${(timeout / 1000)} detik
💎 Bonus ${poin} XP

Ketik *${usedPrefix}who* untuk bantuan
`.trim()

  let msg = await m.reply(caption)

  conn.siapakahaku[id] = [
    msg,
    json,
    poin,
    setTimeout(() => {
      if (conn.siapakahaku[id]) {
        m.reply(`⏰ Waktu habis!\nJawaban: *${json.jawaban}*`)
        delete conn.siapakahaku[id]
      }
    }, timeout)
  ]
}

handler.help = ['siapakahaku']
handler.tags = ['game']
handler.command = /^siapa(kah)?aku$/i
handler.limit = true

export default handler


handler.before = async function (m, { conn }) {
  conn.siapakahaku = conn.siapakahaku ? conn.siapakahaku : {}

  let id = m.chat
  if (!(id in conn.siapakahaku)) return

  let [msg, json, poin, timeout] = conn.siapakahaku[id]
  if (!m.text) return

  let teks = m.text.toLowerCase().trim()
  let jawaban = json.jawaban.toLowerCase().trim()

  if (teks === 'who') {
    let clue = jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')
    m.reply(`Petunjuk:\n\`\`\`${clue}\`\`\``)
    return true
  }

  if (teks === jawaban) {
    clearTimeout(timeout)
    delete conn.siapakahaku[id]

    global.db.data.users[m.sender].exp += poin

    m.reply(`✅ *Benar!*\n\nJawaban: *${jawaban}*\n+${poin} XP`)
  }

  return true
}