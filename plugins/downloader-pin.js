// Pinterest Search + Button
// API : https://anabot.my.id
// Author : Hilman

import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  global.db.data.users = global.db.data.users || {}
  let user = global.db.data.users[m.sender] || {}

  if (command == 'pin') {
    if (!text) throw `*❌ Masukkan query pencarian!*\n\nContoh: ${usedPrefix + command} Elaina`
    user.lastPinterestQuery = text
    global.db.data.users[m.sender] = user
    await sendPinterestImage(m, conn, text, usedPrefix)
  }

  if (command == 'lagi') {
    if (!user.lastPinterestQuery) return m.reply(`⚠️ Belum ada keyword.\nGunakan dulu: ${usedPrefix}pin <keyword>`)
    await sendPinterestImage(m, conn, user.lastPinterestQuery, usedPrefix)
  }
}

handler.help = ['pin', 'lagi']
handler.tags = ['internet']
handler.command = /^pin$|^lagi$/i
handler.limit = true

export default handler

async function sendPinterestImage(m, conn, query, usedPrefix) {
  try {
    let api = `https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(query)}&apikey=freeApikey`
    let res = await fetch(api)
    let json = await res.json()
    if (!json.success || !json.data?.result?.length) return m.reply('❌ Tidak ada hasil ditemukan.')

    let result = json.data.result
    let random = result[Math.floor(Math.random() * result.length)]

    let caption = `✨ *Hasil Pinterest:*\n_${query}_\n\nKetik *.lagi* atau klik tombol di bawah untuk gambar lain.`

    await conn.sendMessage(m.chat, {
      image: { url: random.images["736x"].url },
      caption,
      footer: 'Ryo Yamada - MD',
      buttons: [
        { buttonId: `${usedPrefix}lagi`, buttonText: { displayText: '🔄 Lagi' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil data Pinterest.')
  }
}