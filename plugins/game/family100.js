import fs from 'fs'
import similarity from 'similarity'

const winScore = 4999
const threshold = 0.72
const TIME_LIMIT = 120000

let handler = async (m, { conn }) => {
  conn.family100 = conn.family100 ? conn.family100 : {}

  let id = m.chat
  if (id in conn.family100)
    return m.reply('Masih ada kuis yang belum selesai di chat ini')

  let src = JSON.parse(fs.readFileSync('./json/family100.json', 'utf-8'))
  let json = src[Math.floor(Math.random() * src.length)]

  let soal = json.soal
  let jawaban = json.jawaban.map(v => v.toLowerCase())

  let caption = `
*SOAL:* ${soal}
Terdapat *${jawaban.length}* jawaban

+${winScore} XP tiap jawaban benar
⏳ Waktu: 2 menit
Ketik *nyerah* untuk menyerah
`.trim()

  let msg = await m.reply(caption)

  conn.family100[id] = [
    msg,
    { soal, jawaban, terjawab: Array(jawaban.length).fill(false) },
    winScore,
    setTimeout(() => {
      let data = conn.family100[id]
      if (!data) return
      let { soal, jawaban } = data[1]

      m.reply(`⏰ *Waktu habis!*\n\n*Soal:* ${soal}\n\nJawaban:\n${jawaban.map((v,i)=>`(${i+1}) ${v}`).join('\n')}`)
      delete conn.family100[id]
    }, TIME_LIMIT)
  ]
}

handler.help = ['family100']
handler.tags = ['game']
handler.command = /^family100$/i
handler.limit = false
handler.group = true

export default handler

handler.before = async function (m, { conn }) {
  if (m.fromMe || m.isBaileys) return
  conn.family100 = conn.family100 ? conn.family100 : {}

  let id = m.chat
  if (!(id in conn.family100)) return

  let [msg, data, winScore, time] = conn.family100[id]
  if (!m.text) return

  let text = m.text.toLowerCase().replace(/[^\w\s\-]+/g, '').trim()

  if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
    clearTimeout(time)
    m.reply(`🏳️ *MENYERAH!*\n\nJawaban:\n${data.jawaban.map((v,i)=>`(${i+1}) ${v}`).join('\n')}`)
    delete conn.family100[id]
    return true
  }

  let index = data.jawaban.findIndex(v => similarity(v, text) >= 0.9)

  if (index < 0) {
    let belum = data.jawaban.filter((_, i) => !data.terjawab[i])
    if (belum.length) {
      let mirip = Math.max(...belum.map(v => similarity(v, text)))
      if (mirip >= threshold) m.reply('🤏 Dikit lagi!')
    }
    return true
  }

  if (data.terjawab[index]) return true

  data.terjawab[index] = m.sender
  global.db.data.users[m.sender].exp += winScore

  let isWin = data.terjawab.every(v => v)

  let caption = `
*Soal:* ${data.soal}

${isWin ? '*SEMUA JAWABAN TERJAWAB*' : ''}

${data.jawaban.map((v,i)=>{
  let j = data.terjawab[i]
  return j ? `(${i+1}) ${v} @${j.split('@')[0]}` : ''
}).filter(v=>v).join('\n')}

+${winScore} XP tiap jawaban benar
`.trim()

  await conn.reply(m.chat, caption, null, {
    mentions: data.terjawab.filter(v => v)
  })

  if (isWin) {
    clearTimeout(time)
    delete conn.family100[id]
  }

  return true
}