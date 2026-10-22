let handler = async (m, { conn, text }) => {
  try {
    await m.react('🕒')

    if (!text) {
      await m.react('❌')
      return m.reply('Masukkan nama baru untuk grup ini!')
    }

    if (text.length > 25) {
      await m.react('❌')
      return m.reply('Nama grup terlalu panjang! Maksimal 25 karakter.')
    }

    await conn.groupUpdateSubject(m.chat, text)

    await m.react('✨')
    m.reply(`Nama grup berhasil diubah menjadi:\n*${text}*`)

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Gagal: ${e.message || e}`)
  }
}

handler.help = ['setnamagc']
handler.tags = ['group']
handler.command = /^setnamagc$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler