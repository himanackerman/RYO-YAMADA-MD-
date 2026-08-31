let badwordRegex = /anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|dick|bitch|tits|bastard|asshole|dontol|kontoi|ontol/i

export async function before(m, { conn, isBotAdmin, isAdmin, isOwner }) {
  if (m.isBaileys && m.fromMe) return !0

  let chat = global.db.data.chats[m.chat]
  if (!chat.antiBadword) return !0

  chat.warn = chat.warn || {}
  chat.warn[m.sender] = chat.warn[m.sender] || 0

  let isBadword = badwordRegex.exec(m.text)
  if (!isBadword) return !0

  // hapus pesan toxic
  if (m.isGroup && isBotAdmin) {
    await conn.sendMessage(m.chat, { delete: m.key })
  }

  chat.warn[m.sender] += 1

  let who = m.sender
  let tag = '@' + who.split('@')[0]

  await conn.sendMessage(m.chat, {
    text: `⚠️ ${tag} jangan toxic!\nWarning: ${chat.warn[m.sender]}/3`,
    mentions: [who]
  })

  if (chat.warn[m.sender] >= 3) {
    chat.warn[m.sender] = 0

    if (!isOwner && !isAdmin) {
      if (m.isGroup && isBotAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: `⚠️ ${tag} warning sudah 3x tapi kamu admin/owner jadi tidak di kick.`,
        mentions: [who]
      })
    }
  }

  return !0
}