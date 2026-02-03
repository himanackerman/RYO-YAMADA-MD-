import { createCanvas } from 'canvas'

let handler = async (m, { text, conn }) => {
  const nama = text || m.pushName || 'Orang Lemot'

  const alasan = pick([
    'karena membalas chat 2 hari sekali',
    'karena loading mulu padahal sinyal 5G',
    'karena buka WA kayak nunggu sinetron tayang ulang',
    'karena suka bales "iya" 3 minggu kemudian',
    'karena kecepatan responnya ngalahin kura-kura pensiun'
  ])

  try {
    const canvas = createCanvas(800, 600)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#f3f3f3'
    ctx.fillRect(0, 0, 800, 600)

    // Header
    ctx.fillStyle = '#000'
    ctx.font = 'bold 34px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🐢 SERTIFIKAT KELEMBAMAN INTERNASIONAL 🐢', 400, 80)

    // Nama
    ctx.font = '28px Arial'
    ctx.fillText(`Dianugerahkan kepada: ${nama}`, 400, 170)

    // Alasan
    ctx.font = '22px Arial'
    ctx.fillText(`Sebagai pengakuan resmi`, 400, 230)
    ctx.fillText(`${alasan}`, 400, 270)

    // Footer
    ctx.font = '18px Arial'
    ctx.fillText('Dikeluarkan oleh: Komite Anti Slow Respon Dunia', 400, 450)
    ctx.fillText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 400, 490)

    ctx.fillText('_______________________', 400, 540)
    ctx.fillText('TTD: Ketua Lemot Nasional', 400, 570)

    const buffer = canvas.toBuffer()
    await conn.sendFile(m.chat, buffer, 'sertif-lemot.jpg', `📜 Sertifikat resmi untuk *${nama}*`, m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat sertifikat lemot.')
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

handler.help = ['sertifikatlemot <nama>']
handler.tags = ['fun', 'maker']
handler.command = /^sertifikatlemot$/i
handler.limit = false

export default handler