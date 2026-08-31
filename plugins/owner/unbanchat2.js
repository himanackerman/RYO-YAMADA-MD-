let handler = async (m, { text }) => {
  if (!text)
    return m.reply('Masukkan ID grup.\nContoh:\n.unbanchat2 1203630xxxxx@g.us')

  let id = text.trim()

  if (!id.endsWith('@g.us'))
    return m.reply('ID grup tidak valid.\nFormat: 12036xxxxx@g.us')

  if (!global.db.data.chats[id])
    global.db.data.chats[id] = {}

  global.db.data.chats[id].isBanned = false

  m.reply(`✅ Grup berhasil di-unban:\n${id}`)
}

handler.help = ['unbanchat2']
handler.tags = ['owner']
handler.command = /^unbanchat2$/i
handler.owner = true
handler.limit = false

export default handler