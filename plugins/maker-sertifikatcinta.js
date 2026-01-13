import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import path from 'path'

let handler = async (m, { text, conn }) => {
  const nama = text || m.pushName || 'Kamu'
  const alasan = pick([
    'karena terlalu tampan hingga memicu pemanasan global',
    'karena senyumnya bikin resah warga +62',
    'karena cinta palsunya berhasil menyakiti banyak hati',
    'karena telah membuat 7 dari 10 orang gagal move on',
    'karena berhasil ghosting dengan cara elegan'
  ])

  try {
    const width = 800, height = 600
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#fff0f5'
    ctx.fillRect(0, 0, width, height)

    // Judul
    ctx.fillStyle = '#e91e63'
    ctx.font = 'bold 36px Sans'
    ctx.textAlign = 'center'
    ctx.fillText('💘 SERTIFIKAT CINTA PALSU 💘', width / 2, 100)

    // Nama
    ctx.fillStyle = '#000'
    ctx.font = '28px Sans'
    ctx.fillText(`Diberikan kepada: ${nama}`, width / 2, 200)

    // Alasan
    ctx.font = '22px Sans'
    ctx.fillText(`Sebagai penghargaan`, width / 2, 260)
    ctx.fillText(`karena ${alasan}`, width / 2, 300)

    // Footer
    ctx.font = '18px Sans'
    ctx.fillText(`Dikeluarkan oleh: Dinas Cinta Palsu Internasional`, width / 2, 450)
    ctx.fillText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, width / 2, 490)

    // TTD
    ctx.fillText(`____________________`, width / 2, 550)
    ctx.fillText(`Direktur Patah Hati Nasional`, width / 2, 575)

    const buffer = canvas.toBuffer()
    await conn.sendFile(m.chat, buffer, 'sertifikat-cinta.jpg', `📜 Sertifikat untuk *${nama}* berhasil dibuat.`, m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat sertifikat cinta palsu.')
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

handler.help = ['sertifikatcinta <nama>']
handler.tags = ['maker', 'fun']
handler.command = /^sertifikatcinta$/i
handler.limit = false

export default handler