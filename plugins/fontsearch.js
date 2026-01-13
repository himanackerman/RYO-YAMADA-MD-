import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} Heavitas`)

  try {
    const apiUrl = `https://velyn.biz.id/api/search/font?text=${encodeURIComponent(text)}`
    const { data } = await axios.get(apiUrl)

    if (!data.status || !data.data.length) return m.reply('Font tidak ditemukan.')

    let teks = `*Hasil Pencarian Font:*\n\n`
    for (let font of data.data) {
      teks += `*Judul:* ${font.title}\n`
      teks += `*Added by:* ${font.addedBy}\n`
      teks += `*Download:* ${font.downloadLink}\n`
      teks += `*Preview:* ${font.imageUrl}\n\n`
    }

    await conn.sendMessage(m.chat, { text: teks }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Gagal mencari font. Coba lagi nanti.')
  }
}

handler.help = ['fontsearch <text>']
handler.tags = ['internet']
handler.command = /^fontsearch$/i
handler.limit = true

export default handler