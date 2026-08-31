let handler = async (m, { conn, command, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('Command ini cuma bisa dipakai di grup :v')
  if (!(isAdmin || isOwner)) return global.dfail('admin', m, conn)

  let isMute = command === 'mutegc'

  global.db.data.chats = global.db.data.chats || {}
  let chat = global.db.data.chats[m.chat]
  if (!chat) chat = global.db.data.chats[m.chat] = {}

  if (chat.mutegc === isMute) return m.reply(`Grup ini emang udah ${isMute ? 'di-mute' : 'nggak di-mute'} dari tadi :v`)

  chat.mutegc = isMute
  await global.db.write?.().catch(() => null)

  m.reply(isMute
    ? '🔇 Grup ini di-mute. Cuma owner yang bisa pake bot di sini sekarang.'
    : '🔊 Grup ini di-unmute. Semua member bisa pake bot lagi.')
}

handler.help = ['mutegc', 'unmutegc']
handler.tags = ['owner']
handler.command = /^(mutegc|unmutegc)$/i
handler.owner = true

export default handler