let handler = m => m

handler.before = async function (m, { isBotAdmin, isAdmin }) {
  let chat = global.db.data.chats[m.chat]

  if (!chat?.antiMedia) return
  if (!m.isGroup) return
  if (!isBotAdmin) return
  if (isAdmin) return

  const media =
    m.message?.imageMessage ||
    m.message?.videoMessage ||
    m.message?.audioMessage ||
    m.message?.stickerMessage ||
    m.message?.documentMessage

  if (!media) return

  await this.sendMessage(m.chat, {
    delete: m.key
  })

  await m.reply('❏ Media tidak diperbolehkan di grup ini')
}

export default handler