import axios from 'axios'
import similarity from 'similarity'

const threshold = 0.72
const TIME_LIMIT = 60000

let handler = async (m, { conn }) => {
  conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {}

  let id = m.chat
  if (id in conn.tebakhewan)
    return m.reply('Masih ada soal tebak hewan yang belum selesai')

  let { data } = await axios.get('https://kaizenapi.my.id/api/game/tebakhewan')

  if (!data.status) throw 'Gagal mengambil soal'

  let json = data.data

  let soal = json.deskripsi
  let clue = json.clue
  let image = json.image
  let jawaban = json.jawaban.toLowerCase()
  let reward = json.reward || 5

  let caption = `
— tebak hewan —

❀ deskripsi :
${soal}

❀ clue : ${clue}

❀ waktu : 60 detik
❀ hadiah : ${reward} gold

Ketik *nyerah* untuk menyerah
`.trim()

  let msg = await conn.sendMessage(m.chat, {
    image: { url: image },
    caption
  }, { quoted: m })

  conn.tebakhewan[id] = [
    msg,
    { soal, jawaban, reward },
    setTimeout(() => {
      let data = conn.tebakhewan[id]
      if (!data) return

      m.reply(`⏰ Waktu habis!\n\nJawaban : *${data[1].jawaban}*`)
      delete conn.tebakhewan[id]
    }, TIME_LIMIT)
  ]
}

handler.help = ['tebakhewan']
handler.tags = ['game']
handler.command = /^tebakhewan$/i
handler.limit = true

export default handler

handler.before = async function (m, { conn }) {
  if (m.fromMe || m.isBaileys) return
  conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {}

  let id = m.chat
  if (!(id in conn.tebakhewan)) return

  let [msg, data, time] = conn.tebakhewan[id]
  if (!m.text) return

  let text = m.text.toLowerCase().replace(/[^\w\s\-]+/g, '').trim()

  if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
    clearTimeout(time)

    m.reply(`
🏳️ menyerah!

❀ jawaban : ${data.jawaban}
`.trim())

    delete conn.tebakhewan[id]
    return true
  }

  let sim = similarity(data.jawaban, text)

  if (sim >= 0.9) {
    clearTimeout(time)

    let user = global.db.data.users[m.sender]

    if (!user.gold) user.gold = 0
    user.gold += data.reward

    await conn.reply(
      m.chat,
      `
🎉 benar!

❀ jawaban : ${data.jawaban}
❀ hadiah : +${data.reward} gold
`.trim(),
      m
    )

    delete conn.tebakhewan[id]
  } else if (sim >= threshold) {
    m.reply('🤏 dikit lagi!')
  }

  return true
}