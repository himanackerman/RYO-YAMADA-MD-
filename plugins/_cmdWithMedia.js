export async function all(m, chatUpdate) {
  // skip pesan internal
  if (!m || m.isBaileys) return
  if (!m.message) return

  // pastikan msg ada
  const msg = m.msg || m.message?.conversation
  if (!m.msg) return

  // pastikan fileSha256 ada
  if (!m.msg.fileSha256) return

  const hashKey = Buffer
    .from(m.msg.fileSha256)
    .toString('base64')

  if (!(hashKey in global.db.data.sticker)) return

  let hash = global.db.data.sticker[hashKey]
  let { text, mentionedJid } = hash

  let messages = await generateWAMessage(
    m.chat,
    { text, mentions: mentionedJid },
    {
      userJid: this.user.id,
      quoted: m.quoted?.fakeObj
    }
  )

  messages.key.fromMe = areJidsSameUser(m.sender, this.user.id)
  messages.key.id = m.key.id
  messages.pushName = m.pushName
  if (m.isGroup) messages.participant = m.sender

  chatUpdate.messages = [messages]
}