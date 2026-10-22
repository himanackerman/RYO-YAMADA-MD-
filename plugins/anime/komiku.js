/**
 * Komiku
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API : https://api.nexray.web.id
 * Note : Install dulu npm install pdfkit
 */
 
import axios from 'axios'
import PDFDocument from 'pdfkit'
import sharp from 'sharp'

const API = 'https://api.nexray.eu.cc/anime/komiku'

async function downloadImage(url) {
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'Referer': 'https://komiku.org/' }
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
    const [, chapterUrl] = text.split('|')

    await m.reply('Sedang mengambil gambar & membuat PDF, mohon tunggu...')

    const { data } = await axios.get(`${API}/chapter`, {
      params: { url: chapterUrl.trim() },
      timeout: 30000
    })

    if (!data?.status || !data?.result?.images?.length) throw 'Gagal mengambil gambar chapter'

    const images = data.result.images.map(v => v.url)
    const title = data.result.title || 'Komik'

    const pdfBuffer = await imagesToPDF(images)

    const fileName = title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 60) + '.pdf'

    return await conn.sendMessage(m.chat, {
      document: pdfBuffer,
      mimetype: 'application/pdf',
      fileName,
      caption: `📄 ${title}\nTotal halaman: ${images.length}`
    }, { quoted: m })
  }

  if (/^https:\/\/komiku\.org\/manga\//i.test(text)) {
    const { data } = await axios.get(`${API}/detail`, {
      params: { url: text.trim() },
      timeout: 30000
    })

    if (!data?.status || !data?.result?.chapters?.length) throw 'Chapter tidak ditemukan'

    const detail = data.result

    const caption = `❀ ${detail.title}\n` +
      `Status: ${detail.info?.['status:'] || '-'}\n` +
      `Genre: ${(detail.genres || []).join(', ')}\n` +
      `Total Chapter: ${detail.chapters.length}`

    const btn = new Button(conn)
      .setBody(caption)
      .setFooter('Komiku')

    if (detail.thumbnail) btn.setImage(detail.thumbnail)

    btn.addSelection('❀ Pilih Chapter')
    btn.makeSection('Daftar Chapter')

    detail.chapters.slice(0, 30).forEach(c => {
      btn.makeRow(
        '📖',
        c.title,
        c.date ? `❀ ${c.date}` : 'Tap untuk download PDF',
        `${usedPrefix + command} chapter|${c.link}`
      )
    })

    return await btn.send(m.chat, { quoted: m })
  }

  const { data } = await axios.get(`${API}/search`, {
    params: { q: text },
    timeout: 30000
  })

  if (!data?.status || !data?.result?.length) throw 'Komik tidak ditemukan'

  const hasil = data.result
  const caption = `❀ Hasil pencarian: ${text}\nTotal: ${hasil.length} komik`

  const btn = new Button(conn)
    .setBody(caption)
    .setFooter('Komiku')

  if (hasil[0]?.thumbnail) btn.setImage(hasil[0].thumbnail)

  btn.addSelection('❀ Pilih Komik')
  btn.makeSection('Daftar Komik')

  hasil.slice(0, 20).forEach(v => {
    btn.makeRow(
      '📚',
      v.title,
      `${v.type || '-'} | ${v.description || ''}`.slice(0, 50),
      `${usedPrefix + command} ${v.link}`
    )
  })

  return await btn.send(m.chat, { quoted: m })
}

handler.help = ['komiku']
handler.tags = ['anime']
handler.command = /^komiku$/i
handler.limit = true
handler.register = true

export default handler