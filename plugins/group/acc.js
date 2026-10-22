let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    await m.react('🕒')

    if (!m.isGroup) {
      await m.react('❌')
      return m.reply('Perintah ini hanya bisa digunakan di dalam grup.')
    }

    const chi = await conn.groupRequestParticipantsList(m.chat)
    if (!chi || chi.length === 0) {
      await m.react('❌')
      return m.reply('Tidak ada daftar permintaan bergabung yang tertunda di grup ini.')
    }

    if (args[0] && args[0].toLowerCase() === 'all') {
      const ids = chi.map(v => v.jid)
      await conn.groupRequestParticipantsUpdate(m.chat, ids, 'approve')
      await m.react('✨')
      return m.reply(`Berhasil menyetujui ${ids.length} permintaan bergabung.`)
    }

    const textList = chi.map((v, i) => `${i + 1}. @${v.jid.split('@')[0]}`).join('\n')
    await m.react('✨')
    await m.reply(`*Daftar Pending Request:*\n\n${textList}\n\nKetik *${usedPrefix + command} all* untuk menyetujui semua, atau balas dengan nomor urutnya.`, null, { mentions: chi.map(v => v.jid) })

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Gagal: ${e.message || e}`)
  }
}

handler.help = ['acc']
handler.tags = ['group']
handler.command = ['acc', 'approve']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler