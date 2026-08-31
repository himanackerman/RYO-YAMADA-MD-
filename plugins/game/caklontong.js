import fs from 'fs'
import similarity from 'similarity'

const timeout = 120000
const poin = 4999
const bonusLimit = 5
const threshold = 0.72

let handler = async (m, { conn }) => {
  conn.caklontong = conn.caklontong || {}

  const id = 'caklontong-' + m.chat

  if (id in conn.caklontong) {
    return m.reply('Masih ada soal belum terjawab di chat ini')
  }

  const src = JSON.parse(
    fs.readFileSync('./json/caklontong.json', 'utf-8')
  )

  const json = src[Math.floor(Math.random() * src.length)]

  const caption = `
*CAK LONTONG*

${json.soal}

⏳ Timeout ${timeout / 1000} detik
💡 Ketik *calo* untuk bantuan
🏳️ Ketik *nyerah* untuk menyerah
🎁 Bonus: ${poin} XP
🎟️ Reward: +${bonusLimit} Limit
`.trim()

  const msg = await m.reply(caption)

  conn.caklontong[id] = [
    msg,
    {
      jawaban: (json.jawaban || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim(),
      deskripsi: json.deskripsi || ''
    },
    poin,
    setTimeout(() => {
      if (conn.caklontong[id]) {
        conn.reply(
          m.chat,
          `⏰ *Waktu habis!*\n\n✅ Jawaban: *${json.jawaban}*\n\n${json.deskripsi}`,
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

handler.before = async function (m, { conn }) {
  if (m.fromMe || m.isBaileys) return
  conn.caklontong = conn.caklontong || {}

  const id = 'caklontong-' + m.chat
  if (!(id in conn.caklontong)) return
  if (!m.text) return

  const [msg, data, xp, timer] = conn.caklontong[id]

  const teks = m.text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

  const jawaban = data.jawaban

  if (teks === 'calo') {
    const clue = jawaban.replace(/[aiueo]/gi, '_')
    m.reply(`💡 Clue:\n\`\`\`${clue}\`\`\``)
    return true
  }

  if (/^(nyerah|menyerah|surrender)$/i.test(teks)) {
    clearTimeout(timer)
    delete conn.caklontong[id]

    m.reply(
      `🏳️ *Menyerah!*\n\n✅ Jawaban: *${jawaban}*\n\n${data.deskripsi}`
    )

    return true
  }

  if (teks === jawaban) {
    clearTimeout(timer)
    delete conn.caklontong[id]

    const user = global.db.data.users[m.sender]

    if (user) {
      user.exp = (user.exp || 0) + xp
      user.limit = (user.limit || 0) + bonusLimit
    }

    m.reply(
      `🎉 *Jawaban Benar!*\n\n✨ +${xp} XP\n🎟️ +${bonusLimit} Limit\n\n${data.deskripsi}`
    )

    return true
  }

  const score = similarity(teks, jawaban)

  if (
    score >= threshold &&
    teks !== jawaban &&
    Math.abs(teks.length - jawaban.length) <= 2
  ) {
    m.reply('🤏 *Dikit Lagi!*')
    return true
  }

  return
}

export const exp = 0
export default handler
