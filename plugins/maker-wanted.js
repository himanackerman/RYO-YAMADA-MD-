import axios from 'axios'

let handler = async (m, { conn, args }) => {
  if (!args || args.length === 0) {
    return m.reply('Usage: .wanted <image_url>')
  }
  const imageUrl = args[0]
  const API_KEY = 'LznycxShadow'
  const apiUrl = `https://api.lolhuman.xyz/api/creator1/wanted?apikey=${API_KEY}&img=${encodeURIComponent(imageUrl)}`

  try {
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data),
      caption: '*done buat wanted!*'
    }, { quoted: m })
  } catch (err) {
    console.error('Error wanted:', err.response?.data || err.message)
    if (err.response && err.response.data && err.response.data.message) {
      return m.reply(`❌ ${err.response.data.message}`)
    }
    m.reply('❌ Terjadi kesalahan saat memproses Wanted effect.')
  }
}

handler.help = ['wanted <image_url>']
handler.tags = ['maker']
handler.command = /^wanted$/i

export default handler