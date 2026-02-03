/**
 @ 💫 NikParse
 @ 💫 Source : https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c
 @ 💫 Scrape: https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/206
**/

import axios from 'axios'

const handler = async (m, { args, usedPrefix, command }) => {
  const nik = args[0]
  if (!nik) return m.reply(`Masukkan NIK!\nContoh:\n${usedPrefix + command} 3275010202010001`)
  if (nik.length !== 16) return m.reply('❌ Panjang NIK harus 16 digit.')

  try {
    const res = await parseNIK(nik)
    m.reply(`📄 *Hasil Parsing NIK*\n\n` +
      `• *NIK:* ${res.nik}\n` +
      `• *Jenis Kelamin:* ${res.kelamin}\n` +
      `• *Tanggal Lahir:* ${res.lahir_lengkap} (${res.lahir})\n` +
      `• *Umur:* ${res.tambahan.usia} (${res.tambahan.kategori_usia})\n` +
      `• *Zodiak:* ${res.tambahan.zodiak}\n` +
      `• *Ultah:* ${res.tambahan.ultah}\n` +
      `• *Pasaran:* ${res.tambahan.pasaran}\n\n` +
      `📍 *Wilayah*\n` +
      `• Provinsi: ${res.provinsi.nama}\n` +
      `• ${res.kotakab.jenis}: ${res.kotakab.nama}\n` +
      `• Kecamatan: ${res.kecamatan.nama}\n` +
      `• Kode Wilayah: ${res.kode_wilayah}\n` +
      `• No Urut: ${res.nomor_urut}`
    )
  } catch (err) {
    m.reply('❌ ' + err.message)
  }
}

handler.help = ['nik <nomor>']
handler.tags = ['tools']
handler.command = /^nik$/i
export default handler

// === Fungsi Utama (Mandiri) ===
async function parseNIK(nik) {
  const provinces = Object.fromEntries((await axios.get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json')).data.map(p => [p.id, p.name.toUpperCase()]))
  if (!provinces[nik.slice(0, 2)]) throw new Error('Kode provinsi tidak valid.')

  const provinceId = nik.slice(0, 2)
  const regencies = Object.fromEntries((await axios.get(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`)).data.map(r => [r.id, r.name.toUpperCase()]))
  const regencyId = nik.slice(0, 4)
  if (!regencies[regencyId]) throw new Error('Kode kabupaten/kota tidak valid.')

  const districts = Object.fromEntries((await axios.get(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`)).data.map(d => [d.id.slice(0, -1), d.name.toUpperCase()]))
  const districtId = nik.slice(0, 6)
  if (!districts[districtId]) throw new Error('Kode kecamatan tidak valid.')

  const city = regencies[regencyId]
  const province = provinces[provinceId]
  const subdistrict = districts[districtId]

  const day = parseInt(nik.slice(6, 8))
  const month = parseInt(nik.slice(8, 10))
  const yearCode = nik.slice(10, 12)
  const uniqCode = nik.slice(12, 16)

  const gender = day > 40 ? 'PEREMPUAN' : 'LAKI-LAKI'
  const birthDay = (day > 40 ? day - 40 : day).toString().padStart(2, '0')
  const yearNow = new Date().getFullYear()
  const year = +yearCode <= +String(yearNow).slice(2) ? `20${yearCode}` : `19${yearCode}`
  const birth = new Date(year, month - 1, birthDay)
  if (isNaN(birth)) throw new Error('Tanggal lahir tidak valid.')

  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  let days = today.getDate() - birth.getDate()
  if (days < 0) { days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); months-- }
  if (months < 0) { months += 12; years-- }
  const age = `${years} Tahun ${months} Bulan ${days} Hari`
  const category = years < 12 ? 'Anak-anak' : years < 18 ? 'Remaja' : years < 60 ? 'Dewasa' : 'Lansia'

  const nextBday = new Date(today.getMonth() < month - 1 ? today.getFullYear() : today.getFullYear() + 1, month - 1, birthDay)
  const countdown = `${Math.floor((nextBday - today) / (1000 * 60 * 60 * 24 * 30))} Bulan ${Math.floor((nextBday - today) / (1000 * 60 * 60 * 24) % 30)} Hari`

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const pasaranNames = ['Wage', 'Kliwon', 'Legi', 'Pahing', 'Pon']
  const fullBirth = `${birthDay} ${monthNames[month - 1]} ${year}`
  const pasaran = `${dayNames[birth.getDay()]} ${pasaranNames[Math.round((birth - new Date(1970, 0, 2)) / 86400000) % 5]}, ${fullBirth}`

  const zodiac = (() => {
    const z = [
      [20, 1, 'Aquarius'], [19, 2, 'Pisces'], [21, 3, 'Aries'], [20, 4, 'Taurus'],
      [21, 5, 'Gemini'], [21, 6, 'Cancer'], [23, 7, 'Leo'], [23, 8, 'Virgo'],
      [23, 9, 'Libra'], [24, 10, 'Scorpio'], [23, 11, 'Sagitarius'], [22, 12, 'Capricorn'], [20, 1, 'Aquarius']
    ]
    for (let i = 0; i < z.length - 1; i++) {
      const [dayCut, monthCut, sign] = z[i]
      if (month === monthCut && day >= dayCut || month === z[i + 1][1] && day < z[i + 1][0])
        return sign
    }
    return ''
  })()

  return {
    nik,
    kelamin: gender,
    lahir: `${birthDay}/${String(month).padStart(2, '0')}/${year}`,
    lahir_lengkap: fullBirth,
    provinsi: { kode: provinceId, nama: province },
    kotakab: { kode: regencyId, nama: city, jenis: city.includes('KOTA') ? 'Kota' : 'Kabupaten' },
    kecamatan: { kode: districtId, nama: subdistrict },
    kode_wilayah: `${provinceId}.${regencyId.slice(2)}.${nik.slice(4, 6)}`,
    nomor_urut: uniqCode,
    tambahan: {
      usia: age,
      kategori_usia: category,
      ultah: countdown + ' Lagi',
      pasaran,
      zodiak: zodiac
    }
  }
}