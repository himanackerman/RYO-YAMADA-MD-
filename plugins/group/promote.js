let handler = async (m, { conn, participants, command }) => {
    if (!m.isGroup) throw 'Fitur ini hanya untuk grup!'

    let who = m.mentionedJid?.[0] || m.quoted?.sender
    if (!who) throw `Tag atau reply member yang ingin di${command}!`

    let user = participants.find(v => v.id === who)
    if (!user) throw 'Member tidak ditemukan!'

    if (command === 'promote') {
        if (user.admin) throw 'Dia sudah menjadi admin!'
        await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
        m.reply(`✅ Berhasil mempromosikan @${who.split('@')[0]} menjadi admin.`, null, {
            mentions: [who]
        })
    }

    if (command === 'demote') {
        if (!user.admin) throw 'Dia bukan admin!'
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
        m.reply(`✅ Berhasil menurunkan @${who.split('@')[0]} dari admin.`, null, {
            mentions: [who]
        })
    }
}

handler.help = ['promote @user', 'demote @user']
handler.tags = ['group']
handler.command = /^(promote|demote)$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler