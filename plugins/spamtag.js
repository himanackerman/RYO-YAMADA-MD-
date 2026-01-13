/*

# Fitur : spamtag
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029VbAXI4B1iUxRoQ1aQF24
# Api : lokal

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

const handler = async (m, { conn, text, args, participants }) => {
  try {
    if (!text) return m.reply('❌ Tag orangnya dulu bang, contoh: .spamtag @user')

    const mention = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : ''
    if (!mention) return m.reply('❌ Tag yang bener bang, harus pakai @user')

    const ownerNumber = '6287823745178' 
    const user = db.data.users[m.sender]
    const isOwner = m.sender.includes(ownerNumber)

    const limit = isOwner ? 10 : user?.premium ? 5 : 3

    for (let i = 0; i < limit; i++) {
      await delay(700)
      await conn.sendMessage(m.chat, {
        text: `@${mention.split('@')[0]}`,
        mentions: [mention]
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { text: '✅ Dah tu spam tag' }, { quoted: m })

  } catch (e) {
    m.reply(`❌ Error\nLogs error : ${e.message}`)
  }
}

handler.command = ['spamtag']
handler.help = ['spamtag @user']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}