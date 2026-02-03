/**
 * SpongeBob Brat Meme Plugin (ESM)
 * Command: .bratspongebob / .spongebob
 */

import { createCanvas, loadImage } from "canvas"
import fetch from "node-fetch"

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `Masukkan teks!\n\nContoh:\n${usedPrefix + command} falzx hama banget jir`
    )

  try {
    const imageUrl =
      "https://img1.pixhost.to/images/11791/687260942_vynaa-valerie.jpg"

    const res = await fetch(imageUrl)
    const buffer = await res.arrayBuffer()
    const img = await loadImage(Buffer.from(buffer))

    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(img, 0, 0, img.width, img.height)

    const boardX = img.width * 0.55
    const boardY = img.height * 0.18
    const boardW = img.width * 0.35
    const boardH = img.height * 0.42

    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = text.split(" ")
      let line = ""
      let lines = []

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          lines.push(line)
          line = words[i] + " "
        } else {
          line = testLine
        }
      }
      lines.push(line)

      lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
      return lines.length * lineHeight
    }

    let fontSize = 52
    let textHeight = Infinity

    while (fontSize > 16) {
      ctx.font = `bold ${fontSize}px Arial`
      const lineHeight = fontSize + 6
      textHeight = wrapText(ctx, text, -9999, -9999, boardW, lineHeight)
      if (textHeight <= boardH) break
      fontSize--
    }

    ctx.font = `bold ${fontSize}px Arial`

    wrapText(ctx, text, boardX + boardW / 2, boardY, boardW, fontSize + 6)

    await conn.sendMessage(
      m.chat,
      {
        image: canvas.toBuffer(),
        caption: "🧽 SpongeBob Brat Mode"
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal membuat gambar")
  }
}

handler.help = ["bratspongebob"]
handler.tags = ["maker"]
handler.command = /^(bratspongebob|bratsbb)$/i

export default handler