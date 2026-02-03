import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let url = 'https://api-faa.my.id/faa/papayang'
    let res = await fetch(url)
    if (!res.ok) throw 'Gagal mengambil gambar dari API.'

    let buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'papayang.jpg', 'Nih papayang 😏', m)
  } catch (e) {
    console.error(e)
    m.reply('Gagal mengambil papayang, coba lagi nanti.')
  }
}

handler.help = ['papayang']
handler.tags = ['random']
handler.command = /^papayang$/i
handler.limit = true

export default handler