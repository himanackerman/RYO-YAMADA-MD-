/* 
Sertifikat Tolol
Plugin ESM 
API : https://api.siputzx.my.id
*/
import fetch from 'node-fetch'

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('⚠️ Masukkan nama untuk sertifikatnya!\n\nContoh:\n.sertiftolol Hilman')

  try {
    let url = `https://api.siputzx.my.id/api/m/sertifikat-tolol?text=${encodeURIComponent(text)}`
    let res = await fetch(url)
    if (!res.ok) throw 'Gagal mengunduh gambar.'

    let buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'sertif.jpg', `🏅 Sertifikat untuk: *${text}*`, m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat sertifikat. Coba lagi nanti.')
  }
}

handler.help = ['sertiftolol <nama>', 'sertifikattolol <nama>']
handler.tags = ['maker']
handler.command = /^sertiftolol|sertifikattolol$/i
handler.limit = true

export default handler