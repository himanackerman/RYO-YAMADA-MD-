let handler = async (m, { text }) => {
  if (!text) return m.reply('Masukkan ID grup.\nContoh:\n.banchat2 1203630xxxxx@g.us')

  let id = text.trim()

  if (!id.endsWith('@g.us'))
    return m.reply('ID grup tidak valid.\nFormat: 12036xxxxx@g.us')

  if (!global.db.data.chats[id])
    global.db.data.chats[id] = {}

  global.db.data.chats[id].isBanned = true

  m.reply(`✅ Grup berhasil dibanned:\n${id}`)
}

handler.help = ['banchat2']
handler.tags = ['owner']
handler.command = /^banchat2$/i
handler.owner = true
handler.limit = false

export default handler