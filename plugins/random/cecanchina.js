let handler = async (m, { conn }) => {
  try {
    let url = 'https://api.siputzx.my.id/api/r/cecan/china'
    let caption = `📸 *Random Cecan China*\nSenyumnya bikin semangat 😳`

    await conn.sendFile(m.chat, url, 'cecan.jpg', caption, m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal ambil gambar cecan.\n${e}`)
  }
}

handler.help = ['cecanchina']
handler.tags = ['random']
handler.command = /^cecanchina$/i
handler.limit = true

export default handler