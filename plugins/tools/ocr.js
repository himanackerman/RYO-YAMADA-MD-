/**
 * OCR Image (Optical Character Recognition)
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * Note : install dulu npm install ocr-space-api-wrapper
 */

import { ocrSpace } from 'ocr-space-api-wrapper'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime) {
    return m.reply('❌ Reply gambar.')
  }

  if (!/image\/(png|jpe?g)/i.test(mime)) {
    return m.reply('❌ Hanya png/jpg/jpeg.')
  }

  try {
    let media = await q.download()

    let base64 = `data:${mime};base64,${media.toString('base64')}`

    let result = await ocrSpace(base64, {
      apiKey: 'helloworld',
      language: 'eng'
    })

    let text = result?.ParsedResults?.[0]?.ParsedText

    if (!text) {
      return m.reply('❌ Teks tidak ditemukan.')
    }

    let teks = `
— ocr result —

❀ hasil scan :
${text.trim()}
`

    await conn.sendMessage(m.chat, {
      text: teks
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal melakukan OCR.')
  }
}

handler.help = ['ocr']
handler.tags = ['tools']
handler.command = /^ocr$/i
handler.limit = true
handler.register = true

export default handler