import * as cheerio from 'cheerio'

let handler = async (m, { text }) => {
  if (!text) throw 'Namanya siapa?'

  try {
    const nama = text

    const url =
      `http://www.primbon.com/arti_nama.php?nama1=${encodeURIComponent(nama)}&proses=Submit`

    const res = await fetch(url)

    if (!res.ok) throw 'Gagal mengambil data'

    const body = await res.text()
    const $ = cheerio.load(body)

    let y = $.html().split('arti:')[1]

    if (!y) throw 'Arti nama tidak ditemukan'

    let t = y.split('method="get">')[1]
    let f = y.replace(t || '', '')
    let x = f.replace(/<br\s*\/?>/gi, '\n')
    let h = x.replace(/<[^>]*>?/gm, '').trim()

    m.reply(`Arti Dari Nama ${nama}\n\n${h}`)
  } catch (e) {
    throw 'Gagal mencari arti nama.'
  }
}

handler.help = ['artinama']
handler.tags = ['internet']
handler.command = ['artinama']
handler.limit = true

export default handler