import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  let apikey = 'planaai'
  if (!text) throw `Kirim teks yang mau diucapkan Miku!\n\nContoh: .${command} Haloo Hilman`
  
  await m.react('🎶')
  
  try {
    let res = await fetch(`https://www.sankavolereii.my.id/anime/ttsmiku?apikey=${apikey}&text=${encodeURIComponent(text)}`)
    if (!res.ok) throw await res.text()

    let buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'miku.mp3', `🎶 Miku sudah ngomong: ${text}`, m)
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.reply('❌ Gagal mengambil audio dari API.')
    await m.react('❌')
  }
}

handler.help = ['mikutalk <teks>']
handler.tags = ['tools', 'sound']
handler.command = /^mikutalk$/i
handler.limit = true

export default handler