import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh:\n.mediafire https://www.mediafire.com/file/xxxxx`

  await m.react('🕒')

  try {
    const res = await scraper.mediafiredl(text)

    const caption = `*\`MediaFire Downloader\`*

*Name :* ${res.filename || res.name}
*Size :* ${res.size}
*Mime :* ${res.mime || res.ext || '-'}`

    await conn.sendFile(
      m.chat,
      res.link || res.url,
      res.filename || res.name,
      caption,
      m
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw 'Gagal mengambil file MediaFire.'
  }
}

handler.help = ['mediafire <url>']
handler.tags = ['downloader']
handler.command = ['mediafire', 'mf']

export default handler