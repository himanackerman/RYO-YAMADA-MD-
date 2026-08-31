let handler = async (m, {
    conn, text, isROwner, isOwner, isAdmin, usedPrefix, command
}) => {
    if (text) {
        global.db.data.chats[m.chat].sBye = text
        m.reply('Bye Berhasil Diatur...\n@user [mention]')
    } else return m.reply(`Teksnya Mana..\nContoh:\nSelamat Tinggal Beban @user`)
}
handler.help = ['setbye']
handler.tags = ['group']
handler.command = /^(setbye)$/i
handler.group = true
handler.admin = true

export default handler