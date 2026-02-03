import fetch from 'node-fetch'
import { uploadFile } from '../lib/uploadImage.js'

let handler = async (m, { conn }) => {
  await m.react('✨')

  let q = m.quoted
  if (!q) {
    await conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar lalu ketik *.hapuswm*' },
      { quoted: global.fkontak }
    )
    return
  }

  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) {
    await conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar lalu ketik *.hapuswm*' },
      { quoted: global.fkontak }
    )
    return
  }

  let buffer = await q.download().catch(() => null)
  if (!buffer) return

  try {
    let srcUrl = await uploadFile(buffer)

    let apiUrl = `https://api.snowping.my.id/api/tools/removewm?url=${encodeURIComponent(srcUrl)}`
    let apiRes = await fetch(apiUrl)
    if (!apiRes.ok) throw 'API error'

    let apiJson = await apiRes.json()
    let resultUrl = apiJson?.result?.output?.[0]
    if (!resultUrl) throw 'Result kosong'

    let imgRes = await fetch(resultUrl)
    if (!imgRes.ok) throw 'Fetch image error'

    let imgBuffer = await imgRes.buffer()

    await conn.sendMessage(
      m.chat,
      {
        image: imgBuffer,
        caption: '✨ Remove Watermark'
      },
      {
        quoted: global.fkontak
      }
    )
  } catch {
    await conn.sendMessage(
      m.chat,
      { text: '❌ Gagal menghapus watermark' },
      { quoted: global.fkontak }
    )
  }
}

handler.help = ['hapuswm']
handler.tags = ['tools']
handler.command = /^hapuswm$/i
handler.limit = true

export default handler