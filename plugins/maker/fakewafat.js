import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const __dirname = './tmp'
const fontPath = path.join(__dirname, 'wafatfont.ttf')

async function getBuffer(url) {
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

function drawCircleImg(ctx, img, x, y, size) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size)
  ctx.restore()
}

async function loadAssets() {
  if (!fs.existsSync(__dirname)) {
    fs.mkdirSync(__dirname, { recursive: true })
  }

  if (!fs.existsSync(fontPath)) {
    const res = await fetch('https://uploader.zenzxz.dpdns.org/uploads/1776849905914.ttf')
    const buff = await res.arrayBuffer()
    fs.writeFileSync(fontPath, Buffer.from(buff))
  }

  GlobalFonts.registerFromPath(fontPath, 'WafatFont')
}

async function fakewafat({ fotourl, nama, lahir, wafat }) {
  await loadAssets()

  const bgurl = 'https://uploader.zenzxz.dpdns.org/uploads/1776848882042.jpeg'

  const [bgBuffer, imgBuffer] = await Promise.all([
    getBuffer(bgurl),
    getBuffer(fotourl)
  ])

  const bg = await loadImage(bgBuffer)
  const personImg = await loadImage(imgBuffer)

  const canvas = createCanvas(bg.width, bg.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(bg, 0, 0, bg.width, bg.height)

  const centerX = bg.width / 2
  const fotoSize = 575

  drawCircleImg(ctx, personImg, centerX, 1210, fotoSize)

  ctx.fillStyle = '#462F29'
  ctx.textAlign = 'center'

  ctx.font = '60px WafatFont'
  ctx.fillText(nama, centerX, 1740)

  const rangeTahun = `${lahir} - ${wafat}`
  const midY = (1800 + 1830) / 2

  ctx.font = '40px WafatFont'
  ctx.fillText(rangeTahun, centerX, midY)

  return canvas.toBuffer('image/png')
}

let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh:\n.fakewafat Nama|1995|2026\n\nReply foto`

  let [nama, lahir, wafat] = text.split('|')
  if (!nama || !lahir || !wafat) throw `Contoh:\n.fakewafat Nama|1995|2026\n\nReply foto`

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  let img
  if (/image/.test(mime)) {
    img = await q.download()
  } else if (text.includes('http')) {
    img = text.split(' ').pop()
  } else {
    throw `Contoh:\n.fakewafat Nama|1995|2026\n\nReply foto`
  }

  await m.reply(global.wait)

  let buffer = await fakewafat({
    fotourl: Buffer.isBuffer(img)
      ? `data:image/jpeg;base64,${img.toString('base64')}`
      : img,
    nama,
    lahir,
    wafat
  })

  await conn.sendMessage(m.chat, {
    image: buffer
  }, { quoted: m })
}

handler.help = ['fakewafat']
handler.tags = ['maker']
handler.command = /^fakewafat$/i
handler.limit = true

export default handler