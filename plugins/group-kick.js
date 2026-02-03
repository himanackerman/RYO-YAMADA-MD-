let handler = async (m, { conn, reply, participants }) => {
  const send = reply || ((txt) => m.reply(txt))

  if (!m.isGroup)
    return send('❌ Perintah ini hanya bisa digunakan di grup.')

  let target =
    m.mentionedJid?.[0] ||
    m.msg?.contextInfo?.mentionedJid?.[0] ||
    (m.quoted ? m.quoted.sender : null)

  if (!target) {
    return send(
      '❌ Tag atau reply orang yang ingin dikeluarkan.\n\n' +
      'Contoh:\n' +
      '.kick @user\n' +
      '.kick (reply pesan)'
    )
  }

  if (target === conn.user.jid)
    return send('❌ Tidak bisa mengeluarkan bot.')

  let isTargetAdmin = participants.find(
    p => p.id === target && p.admin
  )

  if (isTargetAdmin)
    return send('❌ Tidak bisa mengeluarkan admin grup.')

  try {
    await conn.groupParticipantsUpdate(
      m.chat,
      [target],
      'remove'
    )

    await conn.sendMessage(m.chat, {
      sticker: { url: 'https://files.catbox.moe/h4q4hq.webp' }
    }, { quoted: m })

  } catch (err) {
    console.error('[KICK ERROR]', err)
    send('❌ Gagal mengeluarkan anggota.')
  }
}

handler.help = ['kick @user', 'kick (reply pesan)']
handler.tags = ['group']
handler.command = ['kick']

handler.admin = true
handler.botAdmin = true
handler.owner = false
handler.premium = false

export default handler