// • Feature : ai4chat
// • Source : https://api.nekolabs.my.id
// • Plugins ESM 
// • Author Hilman 
import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `🧀 Contoh: ${usedPrefix + command} Apa itu bot wa`

  try {
    let api = `https://api.nekolabs.my.id/ai/ai4chat?text=${encodeURIComponent(text)}`
    let res = await fetch(api)
    if (!res.ok) throw await res.text()
    let json = await res.json()

    if (!json.status) throw '❌ Terjadi kesalahan.'
    m.reply(json.result)
  } catch (e) {
    console.error(e)
    throw '❌ Gagal mengambil data.'
  }
}

handler.help = ['ai4chat <teks>']
handler.tags = ['ai']
handler.command = /^ai4chat$/i
handler.limit = true

export default handler