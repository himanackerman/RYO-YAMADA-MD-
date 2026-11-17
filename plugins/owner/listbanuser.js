let handler = async (m, { conn }) => {
  let users = global.db.data.users || {}
  let banned = Object.entries(users).filter(([jid, data]) => data?.banned)

  if (!banned.length)
    return m.reply('✅ Tidak ada user yang sedang dibanned.')

  let caption = `*\`DAFTAR USER TERBANNED\`*\n\nTotal: ${banned.length} user\n\n`
  let mentions = []

  banned.forEach(([jid, data], i) => {
    let num = jid.split('@')[0]
    caption += `${i + 1}. @${num}\n`
    caption += `   ✿ Alasan: ${data.banReason || 'Tidak ada alasan'}\n\n`
    mentions.push(jid)
  })

  caption += `Gunakan *.unban @user* atau *.unban <nomor>* untuk membuka ban.`

  await conn.reply(m.chat, caption.trim(), m, { mentions })
}

handler.help = ['listbanuser', 'listbanned']
handler.tags = ['owner']
handler.command = /^(listban(user)?|listbanned)$/i
handler.owner = true

export default handler
