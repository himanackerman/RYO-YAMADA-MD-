// Search kode pos 
// source Scrape https://whatsapp.com/channel/0029Vb6vl1tJkK71pFdFso0y/123

class KodePosScraper {
  constructor() {
    this.baseUrl = 'https://kodepos.co.id/data'
    this.endpoints = {
      provinsi: '/provinsi.json',
      kota: '/kota.json',
      kecamatan: '/kecamatan.json',
      kelurahan: '/kelurahan.json'
    }
  }

  async fetchData(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      if (!response.ok) throw new Error()
      return await response.json()
    } catch {
      return []
    }
  }

  async search(query) {
    if (!query || typeof query !== 'string' || query.length < 3) {
      return { message: 'Query minimal 3 karakter', data: [] }
    }

    const keyword = query.toLowerCase()

    const [provinsiData, kotaData, kecamatanData, kelurahanData] = await Promise.all([
      this.fetchData(this.endpoints.provinsi),
      this.fetchData(this.endpoints.kota),
      this.fetchData(this.endpoints.kecamatan),
      this.fetchData(this.endpoints.kelurahan)
    ])

    const matches = kelurahanData.filter(item =>
      item.nama.toLowerCase().includes(keyword) ||
      item.kode_pos.toString().includes(keyword) ||
      item.kecamatan_nama.toLowerCase().includes(keyword) ||
      item.kota_nama.toLowerCase().includes(keyword) ||
      item.provinsi_nama.toLowerCase().includes(keyword)
    )

    if (matches.length === 0) {
      return { message: 'Data tidak ditemukan', data: [] }
    }

    const formatted = matches.map(kel => {
      const kec = kecamatanData.find(k => k.nama === kel.kecamatan_nama && k.kota_nama === kel.kota_nama)
      const kot = kotaData.find(c => c.nama === kel.kota_nama && c.provinsi_nama === kel.provinsi_nama)
      const prov = provinsiData.find(p => p.nama === kel.provinsi_nama)

      return {
        kodePos: kel.kode_pos,
        kelurahan: {
          nama: kel.nama,
          kemendagri: kel.kode_kemendagri,
          lat: kel.lat,
          lng: kel.lng,
          elevasi: kel.elevasi
        },
        kecamatan: kec ? {
          nama: kec.nama,
          kemendagri: kec.kode_kemendagri,
          zona: kec.zona_waktu
        } : null,
        kota: kot ? {
          nama: kot.nama,
          kemendagri: kot.kode_kemendagri,
          lat: kot.lat,
          lng: kot.lng
        } : null,
        provinsi: prov ? {
          nama: prov.nama,
          kemendagri: prov.kode_kemendagri,
          zona: prov.zona_waktu
        } : null
      }
    })

    return {
      total: formatted.length,
      query: query,
      results: formatted
    }
  }
}

const scraper = new KodePosScraper()

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      'Masukkan query pencarian.\nContoh: .kodepos Jakarta Barat',
      m,
      { quoted: global.fkontak }
    )
  }

  await conn.reply(m.chat, 'Mencari data kode pos...', m, { quoted: global.fkontak })

  const hasil = await scraper.search(text)

  if (hasil.data?.length === 0 || hasil.results?.length === 0) {
    return conn.reply(m.chat, 'Data tidak ditemukan.', m, { quoted: global.fkontak })
  }

  let teks = `Hasil pencarian: ${hasil.query}\nTotal: ${hasil.total}\n\n`

  hasil.results.slice(0, 10).forEach((r, i) => {
    teks += `${i + 1}. Kode Pos: ${r.kodePos}\n`
    teks += `Kelurahan: ${r.kelurahan.nama}\n`
    teks += `Kecamatan: ${r.kecamatan?.nama || '-'}\n`
    teks += `Kota: ${r.kota?.nama || '-'}\n`
    teks += `Provinsi: ${r.provinsi?.nama || '-'}\n\n`
  })

  await conn.reply(m.chat, teks.trim(), m, { quoted: global.fkontak })
}

handler.help = ['kodepos <query>']
handler.tags = ['tools']
handler.command = /^kodepos$/i
handler.limit = true

export default handler