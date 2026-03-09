let handler = async (m, { conn, reply, participants }) => {
  const send = reply || ((txt) => m.reply(txt))

  if (!m.isGroup)
    return send('❌ Perintah ini hanya bisa digunakan di grup.')

  let target =
    m.mentionedJid?.[0] ||
    m.msg?.contextInfo?.mentionedJid?.[0] ||
    (m.quoted ? m.quoted.sender : null)

  if (!target)
    return send('❌ Tag atau reply orang yang ingin dikeluarkan.')

  if (target === conn.user.jid)
    return send('❌ Tidak bisa mengeluarkan bot.')

  let isTargetAdmin = participants.find(p => p.id === target && p.admin)
  if (isTargetAdmin)
    return send('❌ Tidak bisa mengeluarkan admin grup.')

  let kicked = false
  try {
    const res = await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
    if (Array.isArray(res)) {
      kicked = res[0]?.status === '200' || res[0]?.status === 200
    } else kicked = true
  } catch (e) {
    console.error('[KICK ERROR]', e)
  }

  if (!kicked)
    return send('❌ Gagal mengeluarkan anggota.')
}

handler.help = ['kick @user', 'kick (reply pesan)']
handler.tags = ['group']
handler.command = ['kick']

handler.admin = true
handler.botAdmin = true

export default handler
