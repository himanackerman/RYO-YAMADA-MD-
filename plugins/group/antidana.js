let handler = async (m, { args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("Fitur ini hanya dapat digunakan dalam grup.")
  if (!(isAdmin || isOwner)) return m.reply("Maaf, fitur ini hanya dapat digunakan oleh admin grup.")

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!args[0]) {
    return m.reply("Gunakan:\n.antidana on / off")
  }

  if (args[0] === "on") {
    if (global.db.data.chats[m.chat].antidana) {
      return m.reply("Antidana sudah aktif.")
    }

    global.db.data.chats[m.chat].antidana = true
    return m.reply("✅ Antidana berhasil diaktifkan.")
  }

  if (args[0] === "off") {
    if (!global.db.data.chats[m.chat].antidana) {
      return m.reply("Antidana sudah nonaktif.")
    }

    global.db.data.chats[m.chat].antidana = false
    return m.reply("❌ Antidana berhasil dinonaktifkan.")
  }

  return m.reply("Opsi tidak valid.\nGunakan:\n.antidana on / off")
}

handler.before = async (m, { conn, isBotAdmin, usedPrefix }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  if (typeof m.text === "string") {
    const txt = m.text.toLowerCase()
    if (txt.startsWith((usedPrefix || ".") + "antidana")) return
  }

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!global.db.data.chats[m.chat].antidana) return

  let text = m.text || ''

  // 🔥 deteksi fleksibel
  let isScam =
    text.includes("*DANA bagi-bagi saldo") &&
    text.includes("Aku baru saja dapat") &&
    text.includes("Klik di sini") &&
    /(http|https):\/\/[^\s]+/i.test(text)

  if (!isScam) return

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

  let who = m.sender
  let tag = `@${who.split('@')[0]}`

  return conn.sendMessage(m.chat, {
    text: `${tag}, gausah share link scam kocak`,
    mentions: [who]
  })
}

handler.command = /^antidana$/i
handler.help = ["antidana"]
handler.tags = ["group"]
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler