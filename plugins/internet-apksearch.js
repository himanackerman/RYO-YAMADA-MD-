/*
• fitur : Android App Search (Share All)
• type : plugins esm
• API : https://api.nekolabs.my.id
• author : hilman
*/
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`Contoh penggunaan:\n${usedPrefix}${command} <nama aplikasi>`)

  try {
    const query = encodeURIComponent(args.join(' '))
    const res = await fetch(`https://api.nekolabs.my.id/discovery/android1/search?q=${query}`)
    const json = await res.json()

    if (!json.status || !json.result || json.result.length === 0) throw '🍬 Aplikasi tidak ditemukan'

    const apps = json.result.slice(0, 10) 
    let caption = `🍢 Hasil pencarian untuk: *${args.join(' ')}*\n\n`

    apps.forEach((app, i) => {
      caption += `*${i + 1}.* ${app.name}\n👤 Developer: ${app.developer}\n⭐ Rating: ${app.rating}\n🔗 Link: ${app.url}\n\n`
    })
 
    const thumb = apps[0].icon || null

    await conn.sendMessage(m.chat, {
      image: { url: thumb },
      caption
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    throw `❌ Error\nLogs error : ${e.message || e}`
  }
}

handler.help = ['apksearch <nama aplikasi>', 'androidsearch <nama aplikasi>']
handler.tags = ['internet']
handler.command = /^(apksearch|androidsearch)$/i
handler.limit = true

export default handler