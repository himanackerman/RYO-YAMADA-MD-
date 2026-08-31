let handler = async (m, { args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("Fitur ini hanya dapat digunakan dalam grup.")
  if (!(isAdmin || isOwner)) return m.reply("Maaf, fitur ini hanya dapat digunakan oleh admin grup.")

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!args[0]) {
    return m.reply("Gunakan:\n.antitagsw on / off")
  }

  if (args[0] === "on") {
    if (global.db.data.chats[m.chat].antitagsw) {
      return m.reply("Anti Tag Status WhatsApp sudah aktif.")
    }

    global.db.data.chats[m.chat].antitagsw = true
    return m.reply("✅ Anti Tag Status WhatsApp berhasil diaktifkan.")
  }

  if (args[0] === "off") {
    if (!global.db.data.chats[m.chat].antitagsw) {
      return m.reply("Anti Tag Status WhatsApp sudah nonaktif.")
    }

    global.db.data.chats[m.chat].antitagsw = false
    return m.reply("❌ Anti Tag Status WhatsApp berhasil dinonaktifkan.")
  }

  return m.reply("Opsi tidak valid.\nGunakan:\n.antitagsw on / off")
}

handler.before = async (m, { conn, isBotAdmin, usedPrefix }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  if (typeof m.text === "string") {
    const txt = m.text.toLowerCase()
    if (txt.startsWith((usedPrefix || ".") + "antitagsw")) return
  }

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!global.db.data.chats[m.chat].antitagsw) return

  const isTagStatus =
    m.mtype === "groupStatusMentionMessage" ||
    (m.quoted && m.quoted.mtype === "groupStatusMentionMessage") ||
    (m.message && m.message.groupStatusMentionMessage) ||
    (m.message && m.message.protocolMessage && m.message.protocolMessage.type === 25)

  if (!isTagStatus) return

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

  let tagUser = `@${m.sender.split("@")[0]}`

  return conn.sendMessage(m.chat, {
    text: `*– Anti Tag Status –*\n${tagUser}, mohon tidak menandai grup di Status WhatsApp.`,
    mentions: [m.sender]
  })
}

handler.command = /^antitagsw$/i
handler.help = ["antitagsw"]
handler.tags = ["group"]
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler