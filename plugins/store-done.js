import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const handler = async (m, { text, conn }) => {
  if (!text || !text.includes(',')) {
    return m.reply('❗ Format salah!\nContoh: .done barang,harga,pembayaran')
  }

  const [barang, harga, metode] = text.split(',').map(v => v.trim())

  if (!barang || !harga || !metode) {
    return m.reply('❗ Pastikan semua data terisi dengan format benar:\n.done barang,harga,pembayaran')
  }

  const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
  const canvasWidth = 600
  const canvasHeight = 450
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "#000"
  ctx.font = 'bold 20px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('STRUK PEMBAYARAN', canvasWidth / 2, 40)

  ctx.font = '14px monospace'
  ctx.fillText(`Tanggal/Waktu: ${waktu}`, canvasWidth / 2, 65)

  ctx.textAlign = 'left'
  ctx.fillText(`Layanan: ${barang}`, 20, 100)
  ctx.fillText(`Harga: Rp ${Number(harga).toLocaleString('id-ID')}`, 20, 130)

  ctx.fillText(`Metode Pembayaran: ${metode.toUpperCase()}`, 20, 160)

  ctx.beginPath()
  ctx.moveTo(20, 190)
  ctx.lineTo(canvasWidth - 20, 190)
  ctx.stroke()

  let subtotal = Number(harga)
  let totalPembayaran = subtotal

  ctx.fillText(`Total Pembayaran: Rp ${totalPembayaran.toLocaleString('id-ID')}`, 20, 220)

  ctx.beginPath()
  ctx.moveTo(20, 250)
  ctx.lineTo(canvasWidth - 20, 250)
  ctx.stroke()

  ctx.font = "bold 14px monospace"
  ctx.textAlign = "center"
  ctx.fillText("TERIMA KASIH TELAH BERBELANJA", canvasWidth / 2, 280)
  ctx.fillText("Jangan Lupa Kembali Lagi!", canvasWidth / 2, 300)

  const dirPath = path.join(__dirname, 'tmp')
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }

  const buffer = canvas.toBuffer("image/png")
  const filePath = path.join(dirPath, "receipt.png")
  fs.writeFileSync(filePath, buffer)

  const caption = `
*—·· Transaksi Telah Selesai  ··—*

* *Layanan:* ${barang}
* *Harga:* Rp ${Number(harga).toLocaleString('id-ID')}
* *Payment:* ${metode}
* *Tanggal:* ${waktu}
* *Note:* Terimakasih Telah Mempercayai Kami
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: filePath },
    caption
  }, { quoted: m })

  fs.unlinkSync(filePath)
}

handler.help = ['done <barang,harga,pembayaran>']
handler.tags = ['store']
handler.command = /^done$/i
handler.owner = true

export default handler