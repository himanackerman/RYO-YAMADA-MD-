let handler = async (m, { conn, args }) => {
    const who = m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : args[0]
        ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        : m.sender

    const user = global.db.data.users[who]
    if (typeof user === 'undefined') return m.reply(`User ${who} not in database`)

    if (!args[1]) return m.reply(`Contoh:\n.addmoney @tag 10000\n.addmoney 62812xxxx 5000`)

    let jumlah = parseInt(args[1])
    if (isNaN(jumlah)) return m.reply('Jumlah harus angka.')

    if (!user.money) user.money = 0
    user.money += jumlah

    conn.reply(m.chat,
        `💵 Berhasil menambah *${jumlah} Money* ke @${who.split('@')[0]}\nTotal Money: *${user.money}*`,
        m,
        { mentions: [who] }
    )
}

handler.help = ['addmoney @user/nomor jumlah']
handler.tags = ['owner','rpg']
handler.command = /^addmoney$/i
handler.rowner = true
handler.rpg = true

export default handler