import moment from 'moment-timezone'

const PAY_LINK = 'https://saweria.co/Hilmanytta'

function ucapan() {
  const jam = moment().tz('Asia/Jakarta').hour()
  if (jam >= 4 && jam < 10) return "Selamat pagi"
  if (jam >= 10 && jam < 15) return "Selamat siang"
  if (jam >= 15 && jam < 18) return "Selamat sore"
  return "Selamat malam"
}

let handler = async (m, { conn }) => {

  const caption = `
${ucapan()} 👋

*—·· INFO PEMBAYARAN ··—* 💳

Silakan lakukan pembayaran melalui link Saweria di bawah ini:

🔗 ${PAY_LINK}

Setelah pembayaran, kirim bukti transfer agar pesanan bisa segera diproses 🙏✨
Terima kasih sudah order di store kami 💗
`.trim()

  await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
}

handler.help = ['pay']
handler.tags = ['store']
handler.command = /^pay$/i
handler.owner = false

export default handler