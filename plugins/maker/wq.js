/**
‎✧ Name     : Windows
‎✧ Creator  : Rin imup lucu🤤
‎✧ Category : Canvas
‎✧ Link fitur : https://whatsapp.com/channel/0029Vb6EHtR5Ui2gHMW9zX2x
‎✧ Note : Jangan hapus wm ya, btw ini masih bablas text nya tinggal sesuaikan aja mandiri 🤭
**/

import {
  createCanvas,
  loadImage,
  GlobalFonts
} from '@napi-rs/canvas'
import {
  writeFile,
  mkdir,
  unlink
} from 'node:fs/promises'
import {
  existsSync
} from 'node:fs'
import {
  join
} from 'node:path'
import axios from 'axios'

let handler = async (m, {
  conn,
  text,
  command
}) => {
  if (!text) {
    return m.reply(
      `*Format salah!*\n\nContoh penggunaan:\n.${command} just friend kok manggil sayang dan cemburu`
    )
  }

  const BG_URL =
    'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/wdws.png'

  try {
    await m.reply('⏳ Memproses pembuatan gambar...')

    const ASSETS_DIR = join(process.cwd(), 'assets', 'wdws_meme')
    const FONTS_DIR = join(ASSETS_DIR, 'fonts')
    const BG_LOCAL = join(ASSETS_DIR, 'template_wdws.png')
    const TMP_DIR = 'tmp'

    await mkdir(FONTS_DIR, { recursive: true })
    await mkdir(TMP_DIR, { recursive: true })

    const fontConfigs = [{
      url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2',
      name: 'Inter-Bold.ttf',
      family: 'InterBoldMeme'
    }]

    for (const f of fontConfigs) {
      const fPath = join(FONTS_DIR, f.name)

      if (!existsSync(fPath)) {
        const res = await axios.get(f.url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        })

        await writeFile(fPath, Buffer.from(res.data))
      }

      GlobalFonts.registerFromPath(fPath, f.family)
    }

    if (!existsSync(BG_LOCAL)) {
      const res = await axios.get(BG_URL, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      })

      await writeFile(BG_LOCAL, Buffer.from(res.data))
    }

    const bgImg = await loadImage(BG_LOCAL)

    const canvas = createCanvas(bgImg.width, bgImg.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

    const x = 127
    const y = 406
    const w = 450
    const h = 601

    let fontSize = 150
    const lineHeight = 1.3
    const rawText = text.trim()

    ctx.fillStyle = '#1c1d21'
    ctx.textBaseline = 'top'

    function wrapText(ctx, text, maxWidth) {
      const words = text.split(/\s+/)
      const lines = []
      let line = ''

      for (const word of words) {
        const test = line + word + ' '

        if (ctx.measureText(test.trim()).width > maxWidth && line) {
          lines.push(line.trim())
          line = word + ' '
        } else {
          line = test
        }
      }

      if (line.trim()) lines.push(line.trim())

      return lines
    }

    ctx.font = `700 ${fontSize}px InterBoldMeme`

    let lines = wrapText(ctx, rawText, w)
    let totalHeight = lines.length * (fontSize * lineHeight)

    while (totalHeight > h && fontSize > 24) {
      fontSize -= 4
      ctx.font = `700 ${fontSize}px InterBoldMeme`
      lines = wrapText(ctx, rawText, w)
      totalHeight = lines.length * (fontSize * lineHeight)
    }

    let startY = y

    if (totalHeight < h) {
      startY += (h - totalHeight) / 2
    }

    const wordCount = rawText.split(/\s+/).filter(Boolean).length

    for (let i = 0; i < lines.length; i++) {
      const yy = startY + i * (fontSize * lineHeight)

      if (yy + fontSize > y + h) break

      if (wordCount === 1) {
        ctx.textAlign = 'center'
        ctx.fillText(lines[i], x + w / 2, yy)
      } else {
        ctx.textAlign = 'left'
        ctx.fillText(lines[i], x, yy)
      }
    }

    const outPath = `tmp/wdws-${Date.now()}.png`

    await writeFile(outPath, await canvas.encode('png'))

    await conn.sendFile(
      m.chat,
      outPath,
      'meme_wdws.png',
      `💬 *Quotes Windows Done*\n\n"${rawText}"`,
      m
    )

    if (existsSync(outPath)) {
      await unlink(outPath)
    }
  } catch (err) {
    console.error(err)
    m.reply(`❌ Terjadi kesalahan saat memproses gambar\n\n${err.message}`)
  }
}

handler.help = ['wq <text>']
handler.tags = ['maker']
handler.command = ['wq']

export default handler