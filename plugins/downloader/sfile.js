import { sfileSearch, sfileDownload } from '../../lib/scrape/sfile.js'

let handler = async (m, { conn, text, command }) => {
  if (!text) throw 'Masukkan query atau link!'

  if (command === 'sfile') {
    const results = await sfileSearch(text)

    if (!results.length) throw 'File tidak ditemukan'

    let msg = '🔎 Hasil pencarian:\n\n'

    results.slice(0, 10).forEach((v, i) => {
      msg += `${i + 1}. ${v.title}\n`
      msg += `📦 ${v.size}\n`
      msg += `🔗 ${v.link}\n\n`
    })

    m.reply(msg)
  }

  if (command === 'sfiledl') {
    if (!text.includes('sfile.co')) throw 'Link tidak valid'

    const { metadata, download } = await sfileDownload(text, true)

    const caption = `📄 Nama: ${metadata.filename}
📦 Tipe: ${metadata.mimetype}
⬇️ Download: ${metadata.download_count}
👤 Author: ${metadata.author_name}`

    await conn.sendFile(m.chat, download, metadata.filename, caption, m)
  }
}

handler.help = ['sfile <query>', 'sfiledl <link>']
handler.tags = ['downloader']
handler.command = /^(sfile|sfiledl)$/i
handler.limit = true

export default handler