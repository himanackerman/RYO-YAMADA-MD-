/**
 * SpongeBob Brat Meme Plugin (ESM)
 * Command: .bratspongebob / .bratsbb
 */

import { createCanvas, loadImage } from "@napi-rs/canvas"
import fetch from "node-fetch"
import { sticker } from "../../lib/sticker.js"

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `Masukkan teks!\n\nContoh:\n${usedPrefix + command} halo hilman`
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

    const pngBuffer = canvas.toBuffer("image/png")
    const stickerBuffer = await sticker(pngBuffer, false, 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ', 'ʙy ʜɪʟᴍᴀɴ')

    if (!stickerBuffer) throw "Gagal mengonversi canvas ke stiker"

    await conn.sendMessage(
      m.chat,
      { sticker: stickerBuffer },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal membuat stiker SpongeBob Brat")
  }
}

handler.help = ["bratspongebob"]
handler.tags = ["maker", "sticker"]
handler.command = /^(bratspongebob|bratsbb)$/i

export default handler