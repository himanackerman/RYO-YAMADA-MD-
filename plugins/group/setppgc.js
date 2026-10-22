const handler = async (m, { conn }) => {
  try {
    await m.react('🕒')

    const q = m.quoted || m
    const mime = q.mimetype || q.msg?.mimetype

    if (!mime?.startsWith('image/')) {
      await m.react('❌')
      return m.reply('Reply gambar yang mau dijadikan PP grup.')
    }

    const buffer = await q.download()
    if (!buffer) throw 'Gagal download gambar!'

    const url = await Toolkit.toUrl(conn, buffer, 'image')

    await conn.updateProfilePicture(m.chat, { url })

    await m.react('✨')
    m.reply('Foto profil grup berhasil diubah.')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Gagal: ${e.message || e}`)
  }
}

handler.help = ['setppgc']
handler.tags = ['group']
handler.command = ['setppgc']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler