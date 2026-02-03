import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Example: ${usedPrefix + command} 1+1`)
  }

  await conn.sendMessage(m.chat, {
    react: { text: '🕒', key: m.key }
  })

  try {
    let url = API('lol', '/api/roboguru', {
      query: text,
      grade: 'sma',
      subject: 'sejarah'
    })

    let res = await fetch(url)
    let json = await res.json()

    if (json.status !== 200 || !json.result?.length) {
      return m.reply('Tidak ditemukan jawaban untuk pertanyaan itu')
    }

    let q = json.result[0].question
    let a = json.result[0].answer

    let msg = `📘 *RoboGuru*\n\n*Pertanyaan:*\n${q}\n\n*Jawaban:*\n${a}`

    m.reply(msg)

  } catch (e) {
    m.reply('Terjadi kesalahan saat mengambil data dari Lolhuman')
  }
}

handler.help = ['roboguru <pertanyaan>']
handler.tags = ['internet']
handler.command = /^roboguru$/i
handler.limit = true

export default handler