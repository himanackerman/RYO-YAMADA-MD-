let handler = async (m, { text, command }) => {
  if (!m.isGroup) throw 'Fitur ini hanya untuk grup!'

  let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

  if (command === 'setintro') {
    if (!text) throw `Contoh penggunaan:
.setintro Selamat datang di grup ini

\`\`\`
╭─〔 CARD INTRO 〕
│ • Name        :
│ • Gender      :
│ • Umur        :
│ • Asal        :
│ • Anime Fav   :
│ • Husbu/Waifu :
╰───────────────♡
\`\`\``

    chat.intro = text
    return m.reply('✅ Intro grup berhasil disimpan')
  }

  if (command === 'intro') {
    if (!chat.intro) throw 'Intro belum diset'
    return m.reply(chat.intro)
  }

  if (command === 'delintro') {
    if (!chat.intro) throw 'Intro belum ada'
    delete chat.intro
    return m.reply('🗑️ Intro berhasil dihapus')
  }
}

handler.help = ['setintro', 'intro', 'delintro']
handler.tags = ['group']
handler.command = /^(setintro|intro|delintro)$/i
handler.admin = true
handler.group = true

export default handler