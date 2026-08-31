let handler = async (m, { args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("Fitur ini hanya bisa dipakai di grup.")
  if (!(isAdmin || isOwner)) return m.reply("Khusus admin.")

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!args[0]) {
    return m.reply("Gunakan:\n.antilinkch on / off")
  }

  if (args[0] === "on") {
    if (global.db.data.chats[m.chat].antilinkch) {
      return m.reply("Antilink channel sudah aktif.")
    }
    global.db.data.chats[m.chat].antilinkch = true
    return m.reply("✅ Antilink channel berhasil diaktifkan.")
  }

  if (args[0] === "off") {
    if (!global.db.data.chats[m.chat].antilinkch) {
      return m.reply("Antilink channel sudah nonaktif.")
    }
    global.db.data.chats[m.chat].antilinkch = false
    return m.reply("❌ Antilink channel berhasil dimatikan.")
  }

  return m.reply("Opsi tidak valid.\nGunakan:\n.antilinkch on / off")
}

handler.before = async (m, { conn, isBotAdmin, usedPrefix, isAdmin }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  if (typeof m.text === "string") {
    const txt = m.text.toLowerCase()
    if (txt.startsWith((usedPrefix || ".") + "antilinkch")) return
  }

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!global.db.data.chats[m.chat].antilinkch) return

  let text = m.text || ''

  let isChannel = /https?:\/\/(www\.)?whatsapp\.com\/channel\/[^\s]+/i.test(text)

  if (!isChannel) return

  if (isAdmin) return

  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })
  } catch {}

  let who = m.mentionedJid[0] || m.quoted?.sender || m.sender

  return conn.sendMessage(m.chat, {
    text: `@${who.split('@')[0]} dilarang share link saluran di sini.`,
    mentions: [who]
  })
}

handler.help = ['antilinkch']
handler.tags = ['group']
handler.command = /^antilinkch$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler