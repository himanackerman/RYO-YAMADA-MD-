const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Masukkan link grup WhatsApp.')

  const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
  if (!match) return m.reply('Link grup tidak valid.')

  const code = match[1]

  try {
    await conn.groupAcceptInvite(code)
    m.reply('Berhasil join grup.')
  } catch (e) {
    console.error(e)
    m.reply('Gagal join grup.')
  }
}

handler.help = ['join']
handler.tags = ['owner']
handler.command = ['join']
handler.owner = true

export default handler