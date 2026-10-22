let handler = async (m, { conn, text }) => {
  const n = parseInt(text?.trim())

  if (![1, 2, 3].includes(n)) {
    return m.reply(`Pilih style menu:\n\n*setmenu 1* — Button\n*setmenu 2* — Link Preview Thumbnail Besar\n*setmenu 3* — Button V2`)
  }

  global.menuStyle = n

  // FIX: persist ke db biar nggak reset pas bot restart
  global.db.data.settings = global.db.data.settings || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  global.db.data.settings[conn.user.jid].menuStyle = n
  await global.db.write?.().catch(() => null)

  m.reply(`✅ Menu style diubah ke *Style ${n}*`)
}

handler.help = ['setmenu <1/2/3>']
handler.tags = ['owner']
handler.command = /^setmenu$/i
handler.owner = true

export default handler