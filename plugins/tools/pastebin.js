import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) throw `⚠️ Masukkan link Pastebin!\n\nContoh:\n.pastebin https://pastebin.com/kwLd6w7N`

  try {
    let url = `https://api.princetechn.com/api/download/pastebin?apikey=prince&url=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let data = await res.json()

    if (!data.success) throw `❌ Gagal mengambil data dari Pastebin.`

    let hasil = data.result || 'Tidak ada hasil.'
    await conn.reply(m.chat, hasil, m)
  } catch (e) {
    console.error(e)
    throw `❌ Error mengambil data Pastebin!`
  }
}

handler.help = ['pastebin <url>']
handler.tags = ['tools']
handler.command = /^pastebin$/i
handler.limit = true

export default handler