let handler = async (m, { conn, command }) => {
  try {
    await m.react('🕒')

    if (!m.quoted) {
      await m.react('❌')
      return m.reply('Balas pesan yang ingin dipin!')
    }

    const type = command === 'unpinpesan' ? 2 : 1

    await conn.sendMessage(m.chat, {
      pin: {
        remoteJid: m.quoted.chat,
        fromMe: m.quoted.fromMe,
        id: m.quoted.id,
        participant: m.quoted.sender
      },
      type: type
    })

    await m.react('✨')
    m.reply(type === 1 ? '📌 Pesan berhasil dipin.' : '📌 Pesan berhasil dilepas pin.')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Gagal: ${e.message || e}`)
  }
}

handler.help = ['pinpesan', 'unpinpesan']
handler.tags = ['group']
handler.command = /^(pinpesan|unpinpesan)$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler