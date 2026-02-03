import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let url = 'https://api.zenitsu.web.id/api/berita/kompas'

  let res = await fetch(url)
  if (!res.ok) throw 'Gagal mengambil data berita.'

  let json = await res.json()
  if (!json.results || !json.results.length) throw 'Berita tidak tersedia.'

  let teks = `✦「 BERITA KOMPAS TERBARU 」✦\n\n`

  json.results.slice(0, 10).forEach((v, i) => {
    teks += `${i + 1}. ${v.title}\n`
    teks += `   📌 ${v.category} | 🗓 ${v.date}\n`
    teks += `   🔗 ${v.link}\n\n`
  })

  teks += `Sumber: Kompas`

  await conn.sendMessage(m.chat, { text: teks.trim() }, { quoted: m })
}

handler.help = ['kompas']
handler.tags = ['internet']
handler.command = /^kompas$/i
handler.limit = true

export default handler