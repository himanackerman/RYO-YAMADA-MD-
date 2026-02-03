/**
 * ==============================
 * » Dafont Search
 * ==============================
 * » Type   : Plugin ESM
 * » API    : rynekoo-api.hf.space
 * » Author : Hilman
 * ==============================
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Masukkan nama font!\n\nContoh:\n${usedPrefix + command} coolvetica`

  let url = 'https://rynekoo-api.hf.space/discovery/dafont/search'

  let res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ q: text })
  })

  if (!res.ok) throw 'API tidak merespon.'

  let json = await res.json()
  if (!json.success || !json.result || !json.result.length) {
    throw 'Font tidak ditemukan.'
  }

  let f = json.result[0]

  let caption = `
✦「 DAFONT SEARCH 」✦

🅰️ Nama       : ${f.title}
👤 Author     : ${f.author?.name || '-'}
🎨 Tema       : ${f.theme || '-'}
⬇️ Download   : ${f.totalDownloads || '-'}
🔗 Author     : ${f.author?.link || '-'}
🌐 Font Page  : ${f.url}

Ketik lagi untuk cari font lain.
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: f.previewImage },
    caption
  }, { quoted: m })
}

handler.help = ['dafont <query>']
handler.tags = ['internet']
handler.command = /^dafont$/i
handler.limit = true

export default handler