const handler = async (m, { conn }) => {
  try {
    await m.react('🕒')

    const q = m.quoted || m
    const mime = q.mimetype || q.msg?.mimetype

    if (!mime?.startsWith('image/')) {
      await m.react('❌')
      return m.reply('Reply foto yang mau dijadikan PP bot.')
    }

    const buffer = await q.download()
    if (!buffer) throw 'Gagal download foto!'

    const url = await Toolkit.toUrl(conn, buffer, 'image')

    await conn.updateProfilePicture(conn.user.id, { url })

    await m.react('✨')
    m.reply('Foto profil bot berhasil diubah.')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Gagal: ${e.message || e}`)
  }
}

handler.help = ['setppbot']
handler.tags = ['owner']
handler.command = ['setppbot']
handler.owner = true

export default handler