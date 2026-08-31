let handler = async (m, { conn }) => {
  try {
    let url = 'https://api.siputzx.my.id/api/r/cecan/vietnam'
    await conn.sendFile(m.chat, url, 'cecan-vietnam.jpg', '', m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal ambil gambar cecan Vietnam.\n${e}`)
  }
}

handler.help = ['cecanvietnam']
handler.tags = ['random']
handler.command = /^cecanvietnam$/i
handler.limit = true

export default handler