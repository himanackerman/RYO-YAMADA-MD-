const handler = async (m, { conn, participants }) => {
  if (!m.quoted) throw '🍀 Reply pesan'

  let users = participants
    .map(v => v.id)
    .filter(v => v !== conn.user.jid)

  await conn.sendMessage(m.chat, {
    forward: m.quoted.fakeObj,
    mentions: users
  })
}

handler.help = ['totag']
handler.tags = ['group']
handler.command = /^(totag|tag)$/i
handler.admin = true
handler.group = true

export default handler