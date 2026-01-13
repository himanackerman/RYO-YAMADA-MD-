import fetch from 'node-fetch'
import { load } from 'cheerio'

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.xml')
    const xml = await res.text()

    const $ = load(xml, { xmlMode: true })
    const gempa = $('Infogempa gempa').first()

    const tanggal = gempa.find('Tanggal').text()
    const jam = gempa.find('Jam').text()
    const lintang = gempa.find('Lintang').text()
    const bujur = gempa.find('Bujur').text()
    const magnitude = gempa.find('Magnitude').text()
    const kedalaman = gempa.find('Kedalaman').text()
    const wilayah = gempa.find('Wilayah').text()
    const potensi = gempa.find('Potensi').text()
    const shakemap = gempa.find('Shakemap').text()

    let teks = `🌐 *Info Gempa Terkini - BMKG*\n\n`
    teks += `📅 *Tanggal:* ${tanggal}\n`
    teks += `🕒 *Jam:* ${jam} WIB\n`
    teks += `📍 *Lokasi:* ${lintang} - ${bujur} (${wilayah})\n`
    teks += `📏 *Magnitudo:* ${magnitude}\n`
    teks += `📉 *Kedalaman:* ${kedalaman}\n`
    teks += `🌊 *Potensi:* ${potensi || '—'}`

    const urlShakemap = `https://data.bmkg.go.id/DataMKG/TEWS/${shakemap}`
    await conn.sendFile(m.chat, urlShakemap, 'gempa.jpg', teks, m)
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ Gagal mengambil data dari BMKG langsung.', m)
  }
}

handler.help = ['bmkggempa']
handler.tags = ['info']
handler.command = /^bmkggempa$/i
handler.limit = false

export default handler