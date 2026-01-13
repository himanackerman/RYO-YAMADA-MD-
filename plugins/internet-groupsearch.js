/*

# Fitur : Search WhatsApp Group Random
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : https://api.ownblox.biz.id

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  try {
    if (!text) throw '❌ Error\nLogs error : Kata kunci tidak ditemukan'

    let res = await fetch(`https://api.ownblox.biz.id/api/searchgroups?q=${text}`)
    
    // Cek apakah respons dari API valid
    if (!res.ok) throw `❌ Error\nLogs error : Gagal fetch data, status: ${res.status}`

    // Mengambil dan memparsing JSON
    let json
    try {
      json = await res.json()
    } catch (e) {
      throw `❌ Error\nLogs error : Gagal parsing JSON dari API`
    }

    if (!json.status || !json.result || !json.result.length) throw '❌ Error\nLogs error : Hasil pencarian kosong'
    
    let randomGroup = json.result[Math.floor(Math.random() * json.result.length)]

    // Mengirimkan teks tanpa gambar
    await conn.sendMessage(m.chat, {
      text: `*Title:* ${randomGroup.title}\n*Link:* ${randomGroup.link}`
    }, { quoted: m })
  } catch (e) {
    console.log(e)
    m.reply(`❌ Error\nLogs error : ${e}`)
  }
}

handler.help = ['groupsearch <kata kunci>']
handler.tags = ['internet', 'premium']
handler.command = ['groupsearch']
handler.premium = true

export default handler