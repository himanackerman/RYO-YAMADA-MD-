/*

# Fitur : Anti Tag Status WhatsApp (SW)
# Type : Plugins ESM
# Convert by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : Lokal DB (./database.json)
# Case : https://whatsapp.com/channel/0029VakRR89L7UVPwf53TB0v/6127

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

let handler = async (m, { conn, args, isBotAdmin, prefix, command }) => {
  if (!isBotAdmin) return m.reply('Bot harus jadi admin untuk fitur ini!')

  let db = global.db
  if (!db.data) db.data = {}
  if (!db.data.chats) db.data.chats = {}
  if (!db.data.chats[m.chat]) db.data.chats[m.chat] = {}
  if (!db.data.chats[m.chat].antitagsw) db.data.chats[m.chat].antitagsw = { status: false, count: {} }

  let type = (args[0] || '').toLowerCase()
  switch (type) {
    case 'on':
      if (db.data.chats[m.chat].antitagsw.status) return m.reply('Anti tag semua sudah aktif.')
      db.data.chats[m.chat].antitagsw.status = true
      m.reply('Anti tag semua telah *diaktifkan*!')
      break
    case 'off':
      if (!db.data.chats[m.chat].antitagsw.status) return m.reply('Anti tag semua sudah nonaktif.')
      db.data.chats[m.chat].antitagsw.status = false
      db.data.chats[m.chat].antitagsw.count = {}
      m.reply('Anti tag semua telah *dinonaktifkan*!')
      break
    default:
      m.reply(`*ᴄᴏɴᴛᴏʜ ᴘᴇɴɢɢᴜɴᴀᴀɴ :*\n.ᴀɴᴛɪᴛᴀɢsᴡ ᴏɴ\nᴀɴᴛɪᴛᴀɢsᴡ ᴏғғ`)
  }
}

handler.all = async function (m) {
  let conn = this
  if (!m.isGroup) return
  if (!m.message?.groupStatusMentionMessage) return

  let db = global.db
  let data = db?.data?.chats?.[m.chat]?.antitagsw
  if (!data?.status) return

  let user = m.key.participant || m.sender
  if (!data.count) data.count = {}
  if (!data.count[user]) data.count[user] = 1
  else data.count[user]++

  if (data.count[user] >= 3) {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    delete data.count[user]
  } else {
    await conn.sendMessage(m.chat, {
      text: `@${user.split('@')[0]} *Harap untuk tidak memention status dalam group ini (${data.count[user]}/3)\njika peringatan sudah mencapai 3 maka kamu akak di keluarkan`,
      mentions: [user]
    })
  }
}

handler.command = /^antitagsw$/i
handler.help = ['antitagsw on/off']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler