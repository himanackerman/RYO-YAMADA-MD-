import fs from 'fs'
import similarity from 'similarity'

const winScore = 4999
const threshold = 0.72
const TIME_LIMIT = 120000 // 2 menit

let handler = async (m, { conn }) => {
  conn.game = conn.game ? conn.game : {}
  let id = 'family100_' + m.chat

  if (id in conn.game)
    return m.reply('Masih ada kuis yang belum terjawab di chat ini')

  let src = JSON.parse(fs.readFileSync('./json/family100.json', 'utf-8'))
  let json = src[Math.floor(Math.random() * src.length)]

  let caption = `
*Soal:* ${json.soal}
Terdapat *${json.jawaban.length}* jawaban${json.jawaban.find(v => v.includes(' ')) ? `
(beberapa jawaban terdapat spasi)` : ''}

+${winScore} XP tiap jawaban benar
⏳ Waktu: 2 menit
Ketik *nyerah* untuk menyerah
`.trim()

  let msg = await m.reply(caption)

  conn.game[id] = {
    id,
    chat: m.chat,
    soal: json.soal,
    jawaban: json.jawaban.map(v => v.toLowerCase()),
    terjawab: Array.from(json.jawaban, () => false),
    msg,
    winScore,
    timeout: setTimeout(async () => {
      let room = conn.game[id]
      if (!room) return

      let caption = `
⏰ *WAKTU HABIS!*

*Soal:* ${room.soal}

Jawaban:
${room.jawaban.map((j, i) => `(${i + 1}) ${j}`).join('\n')}
`.trim()

      await conn.reply(m.chat, caption, null)
      delete conn.game[id]
    }, TIME_LIMIT)
  }
}

handler.help = ['family100']
handler.tags = ['game']
handler.command = /^family100$/i
handler.limit = true
handler.group = true

export default handler

export async function before(m, { conn }) {
  conn.game = conn.game ? conn.game : {}
  let id = 'family100_' + m.chat
  if (!(id in conn.game)) return false

  let room = conn.game[id]
  let text = m.text?.toLowerCase().replace(/[^\w\s\-]+/g, '')
  if (!text) return false

  let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text)

  if (isSurrender) {
    clearTimeout(room.timeout)

    let caption = `
🏳️ *MENYERAH!*

*Soal:* ${room.soal}

Jawaban:
${room.jawaban.map((j, i) => `(${i + 1}) ${j}`).join('\n')}
`.trim()

    await conn.reply(m.chat, caption, null)
    delete conn.game[id]
    return true
  }

  let index = room.jawaban.indexOf(text)

  if (index < 0) {
    let belum = room.jawaban.filter((_, i) => !room.terjawab[i])
    if (belum.length) {
      let mirip = Math.max(...belum.map(j => similarity(j, text)))
      if (mirip >= threshold) m.reply('Dikit lagi!')
    }
    return true
  }

  if (room.terjawab[index]) return true

  let users = global.db.data.users[m.sender]
  room.terjawab[index] = m.sender
  users.exp += room.winScore

  let isWin = room.terjawab.every(v => v)

  let caption = `
*Soal:* ${room.soal}

${isWin ? '*SEMUA JAWABAN TERJAWAB*' : ''}

${room.jawaban.map((j, i) => {
  let jawab = room.terjawab[i]
  return jawab
    ? `(${i + 1}) ${j} @${jawab.split('@')[0]}`
    : ''
}).filter(v => v).join('\n')}

+${room.winScore} XP tiap jawaban benar
`.trim()

  await conn.reply(m.chat, caption, null, {
    mentions: room.terjawab.filter(v => v)
  })

  if (isWin) {
    clearTimeout(room.timeout)
    delete conn.game[id]
  }

  return true
}