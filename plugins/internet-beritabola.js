/* 
Berita Bola
Type : Plugins ESM 
API : https://zenz.biz.id
*/

import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://zenz.biz.id/berita/berita-bola')
    const json = await res.json()

    if (!json.status || !json.result) throw 'Gagal mengambil berita bola'

    const beritaList = json.result.slice(0, 10)

    let teks = '⚽ *Berita Bola Terbaru:*\n\n' + beritaList.map((v, i) => {
      return `*${i + 1}. ${v.title}*\n🕒 ${v.published}\n🔗 ${v.link}`
    }).join('\n\n')

    await conn.sendMessage(m.chat, { text: teks.trim() }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('Gagal mengambil berita bola. Coba lagi nanti.')
  }
}

handler.help = ['beritabola']
handler.tags = ['internet']
handler.command = /^beritabola$/i
handler.limit = true

export default handler