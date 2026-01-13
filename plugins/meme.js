/*
📌 Nama Fitur: Meme Random 
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029Vb91Rbi2phHGLOfyPd3N
✍️ Convert By ZenzXD
*/

import axios from 'axios'

let handler = async (m, { conn }) => {
  try {
    const { data: json } = await axios.get('https://api.vreden.my.id/api/meme')

    if (!json.status || !json.result) throw '❌ Gagal mengambil meme.'

    await conn.sendMessage(m.chat, {
      image: { url: json.result },
      caption: ' *Meme Random Kadang Absurd*😐😹'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat mengambil meme.')
  }
}

handler.help = ['meme']
handler.tags = ['internet']
handler.command = /^meme$/i

export default handler