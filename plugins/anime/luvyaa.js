/**
 * Luvyaa
 * -------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * Source scrape : Zynn
  * note : npm install pdfkit sharp
 */
import axios from 'axios'
import * as cheerio from 'cheerio'
import PDFDocument from 'pdfkit'
import sharp from 'sharp'

const BASE = 'https://v4.luvyaa.co'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

async function fetchHtml(url) {
  const { data } = await axios.get(url, {
    timeout: 30000,
    headers: { 'User-Agent': UA }
  })
  return data
}

async function cariManga(query) {
  const searchHtml = await fetchHtml(`${BASE}/?s=${encodeURIComponent(query)}`)
  const $search = cheerio.load(searchHtml)
  const linkPertama = $search('.bsx a').first().attr('href')

  if (!linkPertama) return null

  const detailHtml = await fetchHtml(linkPertama)
  const $detail = cheerio.load(detailHtml)

  const judul = $detail('.entry-title').first().text().trim()

  let sinopsis = ''
  $detail('.entry-content p').each((i, el) => {
    sinopsis += $detail(el).text().trim() + ' '
  })
  sinopsis = sinopsis.trim()

  const getInfo = (label) => {
    const el = $detail('.meta-item').filter((_, e) => {
      return $detail(e).find('.meta-label').text().trim() === label
    }).first()

    if (!el.length) return '-'

    const text = $detail(el).find('.meta-pill').first().text().trim() ||
      $detail(el).text().replace(label, '').trim()

    return text || '-'
  }

  const type = getInfo('Type')
  const author = getInfo('Author')
  const status = $detail('.status-text').text().trim() || '-'

  const genres = []
  $detail('.mgen a').each((i, el) => {
    genres.push($detail(el).text().trim())
  })

  const chapters = []
  $detail('#chapterlist .eph-num').each((i, el) => {
    chapters.push({
      number: $detail(el).find('.chapternum').text().trim(),
      date: $detail(el).find('.chapterdate').text().trim(),
      url: $detail(el).find('a').attr('href')
    })
  })

  const cover = $detail('.thumb img').attr('src') || ''

  return {
    title: judul,
    url: linkPertama,
    cover,
    synopsis: sinopsis,
    type,
    author,
    status,
    genres,
    chapters
  }
}

async function bacaChapter(chapterUrl) {
  const html = await fetchHtml(chapterUrl)
  const match = html.match(/ts_reader\.run\((\{[\s\S]*?\})\);/)

  if (!match) return null

  const readerData = JSON.parse(match[1])
  const images = readerData.sources?.[0]?.images || []

  return { images }
}

async function downloadImage(url) {
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { Referer: `${BASE}/`, 'User-Agent': UA }
  })
  return Buffer.from(data)
}

async function imagesToPDF(imageUrls) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false })
      const chunks = []

      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      for (const url of imageUrls) {
        try {
          let buffer = await downloadImage(url)
          buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer()

          const meta = await sharp(buffer).metadata()
          const { width, height } = meta

          doc.addPage({ size: [width, height] })
          doc.image(buffer, 0, 0, { width, height })
        } catch (e) {
          console.log('Gagal proses gambar:', url, e.message)
        }
      }

      doc.end()
    } catch (e) {
      reject(e)
    }
  })
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh:\n${usedPrefix + command} solo leveling`

  if (text.includes('|')) {
    const [action, param] = text.split('|').map(v => v.trim())

    if (action === 'baca') {
      await m.reply(' Sedang mengambil gambar & membuat PDF, mohon tunggu...')

      const data = await bacaChapter(param)

      if (!data || !data.images.length) throw 'Gagal mengambil gambar chapter'

      const pdfBuffer = await imagesToPDF(data.images)
      const title = param.split('/').filter(Boolean).pop() || 'chapter'
      const fileName = title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 60) + '.pdf'

      return await conn.sendMessage(m.chat, {
        document: pdfBuffer,
        mimetype: 'application/pdf',
        fileName,
        caption: `📄 ${title}\nTotal halaman: ${data.images.length}`
      }, { quoted: m })
    }

    throw 'Aksi tidak dikenali'
  }

  const manga = await cariManga(text)

  if (!manga || !manga.chapters.length) throw 'Komik tidak ditemukan'

  const rows = manga.chapters.slice(0, 40).map(ch => ({
    title: `Chapter ${ch.number}`,
    description: ch.date ? `❀ ${ch.date}` : 'Tap untuk download PDF',
    id: `${usedPrefix + command} baca|${ch.url}`
  }))

  return await conn.sendMessage(m.chat, {
    image: { url: manga.cover },
    caption: `❀ ${manga.title}\n` +
      `Status: ${manga.status}\n` +
      `Type: ${manga.type}\n` +
      `Author: ${manga.author}\n` +
      `Genre: ${manga.genres.join(', ') || '-'}\n` +
      `Total Chapter: ${manga.chapters.length}\n\n` +
      `${manga.synopsis}`,
    footer: 'Luvyaa',
    nativeFlow: [{
      text: '❀ Pilih Chapter',
      sections: [{
        title: 'Daftar Chapter',
        rows
      }]
    }]
  }, { quoted: m })
}

handler.help = ['luvyaa']
handler.tags = ['anime']
handler.command = /^luvyaa$/i
handler.limit = true
handler.register = true

export default handler