import { createCanvas, loadImage, registerFont } from 'canvas'
import fs from 'fs'

let handler = async (m, { conn, args }) => {
  try {
    // daftar font custom
    registerFont('src/font/Zahraaa.ttf', { family: 'Zahraaa' })

    // load background kertas
    let background = await loadImage('src/kertas/magernulis1.jpg')
    let canvas = createCanvas(background.width, background.height)
    let ctx = canvas.getContext('2d')

    // gambar background
    ctx.drawImage(background, 0, 0)

    // data waktu
    let d = new Date()
    let tgl = d.toLocaleDateString('id-Id')
    let hari = d.toLocaleDateString('id-Id', { weekday: 'long' })

    // set font
    ctx.fillStyle = 'black'
    ctx.font = '20px Zahraaa'

    // tulis hari & tanggal
    ctx.fillText(hari, 806, 78)
    ctx.font = '18px Zahraaa'
    ctx.fillText(tgl, 806, 102)

    // teks isi
    let teks = args.join` `
    let wrapped = wrapText(ctx, teks, 43) // bungkus 43 huruf per baris
    ctx.font = '20px Zahraaa'
    drawMultiline(ctx, wrapped, 344, 142, 24) // mulai posisi X=344, Y=142, lineHeight=24

    // hasil buffer
    let buffer = canvas.toBuffer('image/jpeg')
    await conn.sendFile(m.chat, buffer, 'nulis.jpg', '*Hati² ketahuan:v*', m)
  } catch (e) {
    m.reply('❌ Terjadi kesalahan!\n\n' + e.message)
  }
}

// fungsi wrap text (batas huruf per baris)
function wrapText(ctx, text, maxChars) {
  let words = text.split(' ')
  let lines = []
  let line = ''
  for (let word of words) {
    if ((line + word).length > maxChars) {
      lines.push(line.trim())
      line = word + ' '
    } else {
      line += word + ' '
    }
  }
  if (line) lines.push(line.trim())
  return lines
}

// fungsi tulis multi-line
function drawMultiline(ctx, lines, x, y, lineHeight) {
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + (i * lineHeight))
  }
}

handler.help = ['nulis']
handler.tags = ['maker']
handler.command = /^(nulis)$/i
handler.register = true

export default handler