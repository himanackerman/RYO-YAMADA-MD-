const handler = async (m, { conn }) => {
  try {
    await m.react('🕒')

    await conn.removeProfilePicture(m.chat)

    await m.react('✨')
    m.reply('Foto profil grup berhasil dihapus.')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Gagal: ${e.message || e}`)
  }
}

handler.help = ['delppgc']
handler.tags = ['group']
handler.command = ['delppgc', 'removeppgc']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler