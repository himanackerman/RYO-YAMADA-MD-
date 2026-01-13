import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {
  const args = text ? text.split(' ') : []
  if (!args.length) return conn.reply(m.chat, 'Masukkan keyword pencarian!\nContoh: .sfilesearch axis game', m)

  const query = encodeURIComponent(args.join(' '))
  const apiUrl = `https://api.nekorinn.my.id/search/sfile?q=${query}`

  try {
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Gagal mengambil data.')

    const json = await res.json()
    if (!json.status || !json.result.length) {
      return conn.reply(m.chat, 'File tidak ditemukan.', m)
    }

    let teks = `*Hasil pencarian untuk:* ${args.join(' ')}\n\n`
    json.result.slice(0, 10).forEach((v, i) => {
      teks += `${i + 1}. *${v.title.trim()}*\nSize: ${v.size}\nLink: ${v.url}\n\n`
    })

    conn.reply(m.chat, teks, m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, 'Terjadi kesalahan saat mencari file.', m)
  }
}

handler.help = ['sfilesearch']
handler.tags = ['search']
handler.command = ['sfilesearch']
handler.register = true

export default handler